import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        // On récupère les conversations via la table de liaison
        const { data, error } = await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            conversations (
              id,
              name,
              type,
              last_message_at,
              participants:conversation_participants (
                profiles (id, username, firstname, lastname, avatar_url)
              )
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Formater les données pour avoir une liste plate de conversations
        const formatted = data.map(item => {
          const conv = item.conversations;
          // Trouver l'autre participant (si c'est un chat direct)
          const otherParticipant = conv.participants.find(p => p.profiles.id !== user.id)?.profiles;
          return {
            ...conv,
            otherParticipant,
            display_name: conv.name || `${otherParticipant?.firstname} ${otherParticipant?.lastname}`,
            display_avatar: otherParticipant?.avatar_url
          };
        });

        setConversations(formatted);
      } catch (err) {
        console.error("Erreur conversations:", err.message);
      }
    };

    fetchConversations();
  }, [user]);

  // 2. Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConvId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConvId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data);
      } catch (err) {
        console.error("Erreur messages:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Realtime messages
    const channel = supabase
      .channel(`chat_${selectedConvId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `conversation_id=eq.${selectedConvId}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvId]);

  const sendMessage = async (text) => {
    if (!selectedConvId || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ 
          conversation_id: selectedConvId, 
          sender_id: user.id, 
          text 
        }]);

      if (error) throw error;
      
      // Update last_message_at in conversation
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConvId);

    } catch (err) {
      console.error("Erreur envoi message:", err.message);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConvId);

  return (
    <ChatContext.Provider value={{ 
      conversations, 
      selectedConversation, 
      messages, 
      setSelectedConvId, 
      sendMessage,
      loading
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
