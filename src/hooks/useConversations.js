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

    // Real-time subscription for messages to update conversation list
    const channel = supabase
      .channel(`user-conversations-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          // If a new message is inserted, we refresh or update the specific conversation
          // To keep it simple and robust, we just refetch the list
          // But we could also do manual state updates for better performance
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchConversations]);

  return { conversations, loading, error, refresh: fetchConversations };
};
