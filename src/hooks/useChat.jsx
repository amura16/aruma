import { useState, useEffect, useCallback, useRef } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useChat = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedConvRef = useRef(null);

  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  // -------------------------------
  // FETCH CONVERSATIONS
  // -------------------------------
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data: participations, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations:conversation_id ( id, last_message_at )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const formatted = await Promise.all(
        participations.map(async (p) => {
          const { data: otherPart } = await supabase
            .from('conversation_participants')
            .select(`
              profiles:user_id (id, username, firstname, lastname, avatar_url)
            `)
            .eq('conversation_id', p.conversation_id)
            .neq('user_id', user.id)
            .single();

          const { data: lastMsg } = await supabase
            .from('messages')
            .select('text')
            .eq('conversation_id', p.conversation_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const friend = otherPart?.profiles;

          return {
            id: p.conversation_id,
            friend_id: friend?.id,
            display_name: friend
              ? `${friend.firstname} ${friend.lastname}`
              : "Utilisateur",
            display_avatar: friend?.avatar_url,
            last_message: lastMsg?.text || "Nouvelle discussion",
            updated_at: p.conversations?.last_message_at,
            isTemporary: false
          };
        })
      );

      setConversations(
        formatted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      );

    } catch (err) {
      console.error("Erreur fetchConversations:", err.message);
    }
  }, [user]);

  // -------------------------------
  // REALTIME (Correction Doublons)
  // -------------------------------
  useEffect(() => {
    if (!user) return;

    fetchConversations();

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new;

          // On n'ajoute au state que si :
          // 1. C'est la conversation sélectionnée
          // 2. Le message ne vient pas de NOUS (déjà géré par l'UI optimiste)
          if (
            selectedConvRef.current &&
            newMessage.conversation_id === selectedConvRef.current.id &&
            newMessage.sender_id !== user.id
          ) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }

          // Mise à jour de la liste des conversations (Sidebar)
          setConversations(prev =>
            prev.map(c =>
              c.id === newMessage.conversation_id
                ? {
                  ...c,
                  last_message: newMessage.text,
                  updated_at: newMessage.created_at
                }
                : c
            ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  // -------------------------------
  // SELECT CONVERSATION
  // -------------------------------
  const selectConversation = async (convId) => {
    if (!convId) {
      setSelectedConversation(null);
      setMessages([]);
      return;
    }

    const conv = conversations.find(c => c.id === convId);
    if (!conv) return;

    setSelectedConversation(conv);
    setLoading(true);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (!error) setMessages(data);
    setLoading(false);
  };

  // -------------------------------
  // PREPARE TEMP CONVERSATION
  // -------------------------------
  const prepareNewConversation = (friend) => {
    const temp = {
      id: `temp-${friend.id}`,
      friend_id: friend.id,
      display_name: `${friend.firstname} ${friend.lastname}`,
      display_avatar: friend.avatar_url,
      last_message: "",
      isTemporary: true
    };
    setSelectedConversation(temp);
    setMessages([]);
  };

  // -------------------------------
  // SEND MESSAGE (UI Optimiste & Replacement)
  // -------------------------------
  const sendMessage = async (text) => {
    if (!selectedConversation || !text.trim()) return;

    let convId = selectedConversation.id;
    const tempId = `temp-${Date.now()}`;

    // 1. UI Optimiste : Affichage immédiat
    const tempMessage = {
      id: tempId,
      conversation_id: convId,
      sender_id: user.id,
      text: text.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      // Cas d'une nouvelle conversation
      if (selectedConversation.isTemporary) {
        const { data: newConv, error: errC } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();

        if (errC) throw errC;
        convId = newConv.id;

        await supabase.from('conversation_participants').insert([
          { conversation_id: convId, user_id: user.id },
          { conversation_id: convId, user_id: selectedConversation.friend_id }
        ]);

        const newConvData = {
          ...selectedConversation,
          id: convId,
          isTemporary: false,
          updated_at: new Date().toISOString()
        };

        setSelectedConversation(newConvData);
        setConversations(prev => [newConvData, ...prev]);
      }

      // 2. Insertion DB et récupération du message réel
      const { data: realMessage, error: errM } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          sender_id: user.id,
          text: text.trim()
        })
        .select()
        .single();

      if (errM) throw errM;

      // 3. Remplacement du message temporaire par le message réel (avec l'UUID final)
      setMessages(prev =>
        prev.map(m => m.id === tempId ? realMessage : m)
      );

      // Mise à jour sidebar
      setConversations(prev =>
        prev.map(c =>
          c.id === convId
            ? { ...c, last_message: text.trim(), updated_at: realMessage.created_at }
            : c
        )
      );

    } catch (err) {
      console.error("Erreur envoi message:", err.message);
      // Optionnel : Retirer le message du state si l'envoi a échoué
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  return {
    conversations,
    selectedConversation,
    messages,
    loading,
    selectConversation,
    prepareNewConversation,
    sendMessage
  };
};