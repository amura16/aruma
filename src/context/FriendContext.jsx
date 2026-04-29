import React, { createContext, useContext, useState } from 'react';

const FriendContext = createContext();

export const FriendProvider = ({ children }) => {
  const [invitations, setInvitations] = useState([
    { id: 1, name: "Marc Lefebvre", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marc", mutualFriends: 12 },
    { id: 2, name: "Sarah Koné", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", mutualFriends: 5 },
    { id: 3, name: "David Miller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David", mutualFriends: 8 },
  ]);

  const acceptInvitation = (id) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id));
    // In a real app, we'd add to friends list here
  };

  const declineInvitation = (id) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id));
  };

  return (
    <FriendContext.Provider value={{ invitations, acceptInvitation, declineInvitation }}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriendContext = () => useContext(FriendContext);
