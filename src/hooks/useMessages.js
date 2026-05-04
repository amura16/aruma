import { useState, useEffect, useCallback, useRef } from 'react';
import supabase from '../services/supabaseClient';
import { messageService } from '../services/messageService';

export const useMessages = (conversationId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // garder une référence à jour des messages
  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 📥 FETCH MESSAGES
  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    // 🚫 ignore conversation temporaire
    if (typeof conversationId === 'string' && conversationId.startsWith('temp-')) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);

      const data = await messageService.getMessages(conversationId);

      setMessages(data);

      // ✅ mark as read
      if (userId) {
        await messageService.markAsRead(conversationId, userId);
      }

    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, userId]);

  // 🔁 FETCH + REALTIME
  useEffect(() => {
    fetchMessages();

    if (
      !conversationId ||
      (typeof conversationId === 'string' && conversationId.startsWith('temp-'))
    ) {
      return;
    }

    // 🔴 REALTIME LISTENER
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
        async (payload) => {
          const newMessage = payload.new;

          if (!newMessage) return;

          setMessages((prev) => {
            // 🚫 éviter doublons
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          // ✅ auto mark as read si message reçu
          if (newMessage.sender_id !== userId) {
            await messageService.markAsRead(conversationId, userId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, fetchMessages]);

  // 📤 SEND MESSAGE
  const sendMessage = async (text) => {
    if (!text.trim() || !conversationId || !userId) return;

    let targetConvId = conversationId;
    const isTemp =
      typeof conversationId === 'string' && conversationId.startsWith('temp-');

    // ⚡ optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversation_id: targetConvId,
      sender_id: userId,
      text: text.trim(),
      created_at: new Date().toISOString(),
      is_read: false
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // 🆕 créer conversation si temporaire
      if (isTemp) {
        const friendId = conversationId.replace('temp-', '');

        targetConvId = await messageService.createConversation(
          userId,
          friendId
        );
      }

      const realMsg = await messageService.sendMessage(
        targetConvId,
        userId,
        text
      );

      // 🔁 remplacer optimistic par vrai message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? realMsg : m))
      );

      return {
        success: true,
        conversationId: targetConvId
      };

    } catch (err) {
      console.error('Error sending message:', err);

      // ❌ rollback
      setMessages((prev) => prev.filter((m) => m.id !== tempId));

      return {
        success: false,
        error: err
      };
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage
  };
};