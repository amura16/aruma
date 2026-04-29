import { useChatContext } from '../context/ChatContext';

export const useChat = () => {
  const { 
    contacts, 
    selectedContact, 
    currentMessages, 
    setSelectedContactId, 
    sendMessage 
  } = useChatContext();

  return {
    contacts,
    selectedContact,
    messages: currentMessages,
    selectContact: setSelectedContactId,
    sendMessage: (text) => {
      if (selectedContact) {
        sendMessage(selectedContact.id, text);
      }
    }
  };
};
