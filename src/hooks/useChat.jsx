import { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Charger la liste des discussions au montage
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          last_message,
          updated_at,
          participant_id,
          friend:profiles!participant_id(id, username, firstname, lastname, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formatted = data.map(c => ({
        id: c.id,
        display_name: `${c.friend.firstname} ${c.friend.lastname}`,
        display_avatar: c.friend.avatar_url,
        friend_id: c.friend.id,
        last_message: c.last_message,
        isTemporary: false
      }));
      setConversations(formatted);
    } catch (err) {
      console.error("Erreur fetchConversations:", err.message);
    }
  };

  // 2. Sélectionner une discussion et charger les messages
  const selectConversation = async (conversationId) => {
    if (!conversationId) {
      setSelectedConversation(null);
      setMessages([]);
      return;
    }

    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    setSelectedConversation(conv);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error) setMessages(data);
  };

  /**
   * 3. Préparer une discussion "fantôme" (Instantanéité)
   * Appelé quand on clique sur un ami dans la recherche qui n'a pas encore de chat.
   */
  const prepareNewConversation = (friend) => {
    const temporaryConv = {
      id: `temp-${friend.id}`,
      display_name: `${friend.firstname} ${friend.lastname}`,
      display_avatar: friend.avatar_url,
      friend_id: friend.id,
      last_message: "",
      isTemporary: true
    };

    setSelectedConversation(temporaryConv);
    setMessages([]); // On vide la zone de chat pour le nouvel utilisateur
  };

  /**
   * 4. Envoyer un message (Gère la création auto de la conv si temporaire)
   */
  const sendMessage = async (text) => {
    if (!selectedConversation || !text.trim()) return;

    let currentConvId = selectedConversation.id;

    try {
      // SI LA CONVERSATION EST TEMPORAIRE : On la crée réellement en base
      if (selectedConversation.isTemporary) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert([
            { user_id: user.id, participant_id: selectedConversation.friend_id }
          ])
          .select().single();

        if (convError) throw convError;

        currentConvId = newConv.id;

        // On met à jour l'état de la sélection pour qu'elle devienne "réelle"
        setSelectedConversation(prev => ({
          ...prev,
          id: currentConvId,
          isTemporary: false
        }));
      }

      // ENVOI DU MESSAGE
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: currentConvId,
            sender_id: user.id,
            text: text.trim()
          }
        ])
        .select().single();

      if (msgError) throw msgError;

      // Mise à jour locale des messages
      setMessages(prev => [...prev, msgData]);

      // Mettre à jour le dernier message dans la liste latérale
      await supabase
        .from('conversations')
        .update({ last_message: text.trim(), updated_at: new Date() })
        .eq('id', currentConvId);

      fetchConversations(); // Rafraîchir la sidebar pour voir la nouvelle discussion

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
    prepareNewConversation, // À utiliser dans Messages.jsx
    sendMessage,
    fetchConversations
  };
};