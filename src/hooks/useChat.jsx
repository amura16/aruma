import { useChatContext } from '../context/ChatContext';

export const useChat = () => {
  const { 
    conversations, 
    selectedConversation, 
    messages, 
    setSelectedConvId, 
    sendMessage,
    loading
  } = useChatContext();

  return {
    conversations,
    selectedConversation,
    messages,
    selectConversation: setSelectedConvId,
    sendMessage,
    loading
  };
};
