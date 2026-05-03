import { useState, useEffect, useCallback, useRef } from 'react';
import supabase from '../services/supabaseClient';
import { messageService } from '../services/messageService';

export const useMessages = (conversationId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    
    // If conversationId is a temporary one (starting with 'temp-'), don't fetch
    if (typeof conversationId === 'string' && conversationId.startsWith('temp-')) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      const data = await messageService.getMessages(conversationId);
      setMessages(data);
      // Mark as read when opening conversation
      await messageService.markAsRead(conversationId, userId);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, userId]);

  useEffect(() => {
    fetchMessages();

    if (!conversationId || (typeof conversationId === 'string' && conversationId.startsWith('temp-'))) return;

    // Real-time subscription for messages in this conversation
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new;
          // Only add if it's not from the current user (optimistic update handled separately)
          // Actually, let's check if it's already in the list by id
          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          
          // Mark as read if the message is from someone else
          if (newMessage.sender_id !== userId) {
            messageService.markAsRead(conversationId, userId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, fetchMessages]);

  const sendMessage = async (text) => {
    if (!text.trim() || !conversationId || !userId) return;

    let targetConvId = conversationId;
    const isTemp = typeof conversationId === 'string' && conversationId.startsWith('temp-');

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversation_id: targetConvId,
      sender_id: userId,
      text: text.trim(),
      created_at: new Date().toISOString(),
      is_read: false
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      // If temporary, we need to create the conversation first
      if (isTemp) {
        const friendId = conversationId.split('-')[1];
        targetConvId = await messageService.createConversation(userId, friendId);
        // Note: The parent component should handle updating the selectedConversation ID
      }

      const realMsg = await messageService.sendMessage(targetConvId, userId, text);
      
      setMessages(prev => prev.map(m => m.id === tempId ? realMsg : m));
      return { success: true, conversationId: targetConvId };
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      return { success: false, error: err };
    }
  };

  return { messages, loading, error, sendMessage };
};
