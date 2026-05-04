import { useState, useEffect, useCallback } from 'react';
import supabase from '../services/supabaseClient';
import { messageService } from '../services/messageService';

export const useConversations = (userId) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await messageService.getConversations(userId);
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();

    if (!userId) return;

    // Real-time subscription for messages and new conversations
    const channel = supabase
      .channel(`user-conversations-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => fetchConversations()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`
        },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchConversations]);

  return { conversations, loading, error, refresh: fetchConversations };
};
