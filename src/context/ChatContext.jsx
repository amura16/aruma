import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Inès Bella", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ines", lastMsg: "Tu as vu le dernier post ?", time: "14:20", online: true },
    { id: 2, name: "Thomas Durant", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas", lastMsg: "Ok, à demain !", time: "Hier", online: true },
    { id: 3, name: "Julie Rose", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julie", lastMsg: "Merci beaucoup !", time: "Lun", online: false },
  ]);

  const [messages, setMessages] = useState({
    1: [
      { id: 101, text: "Salut ! Tu as pu avancer sur le projet ArumA ?", sender: 'them', time: '14:15' },
      { id: 102, text: "Oui, je viens de finir la structure des messages. C'est responsive ! 🚀", sender: 'me', time: '14:18' },
      { id: 103, text: "Top ! Je vais tester ça tout de suite.", sender: 'them', time: '14:20' },
    ],
    2: [],
    3: [],
  });

  const [selectedContactId, setSelectedContactId] = useState(null);

  const sendMessage = (contactId, text) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage],
    }));

    // Update last message in contacts
    setContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, lastMsg: text, time: "À l'instant" } : c
    ));
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const currentMessages = messages[selectedContactId] || [];

  return (
    <ChatContext.Provider value={{ 
      contacts, 
      selectedContact, 
      currentMessages, 
      setSelectedContactId, 
      sendMessage 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
