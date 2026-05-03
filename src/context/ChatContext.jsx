import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeConvId, setActiveConvId] = useState(null);

  const { 
    conversations, 
    loading: loadingConversations, 
    refresh: refreshConversations 
  } = useConversations(user?.id);

  const { 
    messages, 
    loading: loadingMessages, 
    sendMessage: hookSendMessage 
  } = useMessages(activeConvId, user?.id);

  // Total unread count for global notifications
  const totalUnreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  const selectedConversation = conversations.find(c => c.id === activeConvId);

  const sendMessage = async (text) => {
    const result = await hookSendMessage(text);
    if (result?.success && result?.conversationId !== activeConvId) {
      // Transition from temporary to real conversation
      setActiveConvId(result.conversationId);
      refreshConversations();
    }
    return result;
  };

  return (
    <ChatContext.Provider value={{ 
      conversations, 
      selectedConversation, 
      messages, 
      setSelectedConvId: setActiveConvId, 
      sendMessage,
      loading: loadingConversations || loadingMessages,
      totalUnreadCount,
      refreshConversations
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
