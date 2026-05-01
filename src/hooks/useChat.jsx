import { useState, useEffect, useCallback, useRef } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Utiliser une ref pour que le listener Realtime ait toujours la version à jour
  const selectedConvRef = useRef(null);
  useEffect(() => { selectedConvRef.current = selectedConversation; }, [selectedConversation]);

  // --- FETCH INITIAL ---
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data: participations, error } = await supabase
      .from('conversation_participants')
      .select(`conversation_id, conversations:conversation_id ( id, last_message_at )`)
      .eq('user_id', user.id);

    if (error) return;

    const formatted = await Promise.all(participations.map(async (p) => {
      const { data: otherPart } = await supabase
        .from('conversation_participants')
        .select(`profiles:user_id (id, username, firstname, lastname, avatar_url)`)
        .eq('conversation_id', p.conversation_id).neq('user_id', user.id).single();

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('text, created_at').eq('conversation_id', p.conversation_id)
        .order('created_at', { ascending: false }).limit(1).maybeSingle();

      const { count: unreadCount } = await supabase
        .from('messages').select('*', { count: 'exact', head: true })
        .eq('conversation_id', p.conversation_id).eq('is_read', false).neq('sender_id', user.id);

      const friend = otherPart?.profiles;
      return {
        id: p.conversation_id,
        friend_id: friend?.id,
        display_name: friend ? `${friend.firstname} ${friend.lastname}` : "Utilisateur",
        display_avatar: friend?.avatar_url,
        last_message: lastMsg?.text || "Nouvelle discussion",
        updated_at: lastMsg?.created_at || p.conversations?.last_message_at,
        unread_count: unreadCount || 0
      };
    }));
    setConversations(formatted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
  }, [user]);

  // --- MARQUER COMME LU ---
  const markAsRead = async (convId) => {
    if (!user || !convId || convId.toString().startsWith('temp')) return;
    await supabase.from('messages').update({ is_read: true })
      .eq('conversation_id', convId).neq('sender_id', user.id).eq('is_read', false);

    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));
  };

  // --- REALTIME ---
  useEffect(() => {
    if (!user) return;
    fetchConversations();

    const channel = supabase.channel('chat-main')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new;
        const currentConv = selectedConvRef.current;

        // 1. Si c'est le message de la conversation active
        if (currentConv && newMessage.conversation_id === currentConv.id) {
          if (newMessage.sender_id !== user.id) {
            setMessages(prev => [...prev.filter(m => m.id !== newMessage.id), newMessage]);
            markAsRead(currentConv.id);
          }
        }

        // 2. Toujours mettre à jour la liste à gauche
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id === newMessage.conversation_id) {
              const isNotActive = currentConv?.id !== c.id;
              const isFromOther = newMessage.sender_id !== user.id;
              return {
                ...c,
                last_message: newMessage.text,
                updated_at: newMessage.created_at,
                unread_count: (isNotActive && isFromOther) ? c.unread_count + 1 : c.unread_count
              };
            }
            return c;
          });
          return [...updated].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations]);

  // --- SELECT ---
  const selectConversation = async (convId) => {
    if (!convId) { setSelectedConversation(null); setMessages([]); return; }
    const conv = conversations.find(c => c.id === convId);
    if (!conv) return;
    setSelectedConversation(conv);

    const { data } = await supabase.from('messages').select('*')
      .eq('conversation_id', convId).order('created_at', { ascending: true });
    if (data) setMessages(data);
    markAsRead(convId);
  };

  // --- PREPARE TEMP ---
  const prepareNewConversation = (friend) => {
    setSelectedConversation({
      id: `temp-${friend.id}`,
      friend_id: friend.id,
      display_name: `${friend.firstname} ${friend.lastname}`,
      display_avatar: friend.avatar_url,
      isTemporary: true
    });
    setMessages([]);
  };

  // --- SEND ---
  const sendMessage = async (text) => {
    if (!selectedConversation || !text.trim()) return;
    let convId = selectedConversation.id;
    const isTemp = selectedConversation.isTemporary;

    // UI Optimiste
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = { id: tempId, conversation_id: convId, sender_id: user.id, text: text.trim(), created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      if (isTemp) {
        const { data: nConv } = await supabase.from('conversations').insert({}).select().single();
        await supabase.from('conversation_participants').insert([
          { conversation_id: nConv.id, user_id: user.id },
          { conversation_id: nConv.id, user_id: selectedConversation.friend_id }
        ]);
        convId = nConv.id;
        setSelectedConversation({ ...selectedConversation, id: convId, isTemporary: false });
        fetchConversations(); // Recharger la liste pour inclure la nouvelle conv
      }

      const { data: realMsg, error } = await supabase.from('messages')
        .insert({ conversation_id: convId, sender_id: user.id, text: text.trim() }).select().single();

      if (error) throw error;
      setMessages(prev => prev.map(m => m.id === tempId ? realMsg : m));
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  return { conversations, selectedConversation, messages, loading, selectConversation, prepareNewConversation, sendMessage };
};