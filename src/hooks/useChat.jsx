import { useState, useEffect, useCallback } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 1. RÉCUPÉRATION DES CONVERSATIONS (SIDEBAR) ---
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Étape A : Récupérer les ID de conversations où l'utilisateur est présent
      const { data: participations, error: partError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations:conversation_id (
            id,
            last_message_at
          )
        `)
        .eq('user_id', user.id);

      if (partError) throw partError;

      // Étape B : Pour chaque conversation, récupérer les infos de l'ami et le dernier message
      const formatted = await Promise.all(
        participations.map(async (p) => {
          // Trouver l'autre participant
          const { data: otherPart } = await supabase
            .from('conversation_participants')
            .select(`profiles:user_id (id, username, firstname, lastname, avatar_url)`)
            .eq('conversation_id', p.conversation_id)
            .neq('user_id', user.id)
            .single();

          // Récupérer le texte du dernier message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('text')
            .eq('conversation_id', p.conversation_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const friend = otherPart?.profiles;
          return {
            id: p.conversation_id,
            friend_id: friend?.id,
            display_name: friend ? `${friend.firstname} ${friend.lastname}` : "Utilisateur Inconnu",
            display_avatar: friend?.avatar_url,
            last_message: lastMsg?.text || "Nouvelle discussion",
            updated_at: p.conversations?.last_message_at,
            isTemporary: false
          };
        })
      );

      // Tri par date décroissante
      setConversations(formatted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
    } catch (err) {
      console.error("Erreur fetchConversations:", err.message);
    }
  }, [user]);

  // --- 2. GESTION DU TEMPS RÉEL ---
  useEffect(() => {
    if (!user) return;

    fetchConversations();

    // Canal unique pour écouter les nouveaux messages et les mises à jour de conv
    const channel = supabase
      .channel('realtime-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        // Si le message appartient à la conversation ouverte, on l'ajoute à l'écran
        if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
          setMessages(prev => [...prev, payload.new]);
        }
        // On rafraîchit la sidebar pour tout le monde (dernier message / ordre)
        fetchConversations();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations'
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation, fetchConversations]);

  // --- 3. SÉLECTION D'UNE DISCUSSION ---
  const selectConversation = async (convId) => {
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

  // --- 4. PRÉPARATION D'UN CHAT "FANTÔME" (DEPUIS RECHERCHE) ---
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

  // --- 5. ENVOI DE MESSAGE ---
  const sendMessage = async (text) => {
    if (!selectedConversation || !text.trim()) return;

    let convId = selectedConversation.id;

    try {
      // Création de la conversation si elle est temporaire
      if (selectedConversation.isTemporary) {
        // A. Créer la ligne conversation
        const { data: newConv, error: errC } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();
        if (errC) throw errC;
        convId = newConv.id;

        // B. Ajouter les participants
        const { error: errP } = await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: convId, user_id: user.id },
            { conversation_id: convId, user_id: selectedConversation.friend_id }
          ]);
        if (errP) throw errP;

        setSelectedConversation(prev => ({ ...prev, id: convId, isTemporary: false }));
      }

      // C. Insérer le message
      const { error: errM } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          sender_id: user.id,
          text: text.trim()
        });
      if (errM) throw errM;

      // D. Mettre à jour le timestamp de la conversation pour le tri
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date() })
        .eq('id', convId);

    } catch (err) {
      console.error("Erreur envoi message:", err.message);
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