import { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les conversations au montage
  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    // Logique pour récupérer les discussions existantes avec les profils
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

    if (!error) {
      const formatted = data.map(c => ({
        id: c.id,
        display_name: `${c.friend.firstname} ${c.friend.lastname}`,
        display_avatar: c.friend.avatar_url,
        friend_id: c.friend.id,
        last_message: c.last_message
      }));
      setConversations(formatted);
    }
  };

  const selectConversation = async (conversationId) => {
    if (!conversationId) {
      setSelectedConversation(null);
      setMessages([]);
      return;
    }

    const conv = conversations.find(c => c.id === conversationId);
    setSelectedConversation(conv);

    // Charger les messages de cette conversation
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  /**
   * LOGIQUE CRUCIALE : Démarrer une nouvelle discussion
   */
  const startNewConversation = async (friendId) => {
    setLoading(true);
    try {
      // 1. Créer la conversation dans la table
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert([
          { user_id: user.id, participant_id: friendId }
        ])
        .select(`
          id,
          friend:profiles!participant_id(id, username, firstname, lastname, avatar_url)
        `)
        .single();

      if (error) throw error;

      const formatted = {
        id: newConv.id,
        display_name: `${newConv.friend.firstname} ${newConv.friend.lastname}`,
        display_avatar: newConv.friend.avatar_url,
        friend_id: newConv.friend.id,
        last_message: ""
      };

      // 2. Mettre à jour l'état local
      setConversations(prev => [formatted, ...prev]);

      // 3. Sélectionner la nouvelle conversation
      setSelectedConversation(formatted);
      setMessages([]);

    } catch (err) {
      console.error("Erreur création conversation:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text) => {
    if (!selectedConversation || !text.trim()) return;

    const newMessage = {
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      text: text.trim()
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([newMessage])
      .select()
      .single();

    if (!error) {
      setMessages(prev => [...prev, data]);
      // Optionnel : mettre à jour le last_message dans la table conversations ici
    }
  };

  return {
    conversations,
    selectedConversation,
    messages,
    loading,
    selectConversation,
    startNewConversation,
    sendMessage
  };
};