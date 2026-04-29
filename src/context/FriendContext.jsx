import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const FriendContext = createContext();

export const FriendProvider = ({ children }) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchInvitations = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('invitations')
          .select(`
            *,
            sender:sender_id (id, username, firstname, lastname, avatar_url)
          `)
          .eq('receiver_id', user.id)
          .eq('status', 'pending');

        if (error) throw error;
        
        // Formater pour que le composant reçoive les bonnes clés
        const formatted = data.map(inv => ({
          id: inv.id,
          name: `${inv.sender.firstname} ${inv.sender.lastname}`,
          avatar: inv.sender.avatar_url,
          mutualFriends: 0 // Optionnel pour l'instant
        }));

        setInvitations(formatted);
      } catch (err) {
        console.error("Erreur invitations:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [user]);

  const acceptInvitation = async (id) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', id);

      if (error) throw error;
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      console.error("Erreur acceptation:", err.message);
    }
  };

  const declineInvitation = async (id) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'declined' })
        .eq('id', id);

      if (error) throw error;
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      console.error("Erreur refus:", err.message);
    }
  };

  return (
    <FriendContext.Provider value={{ invitations, acceptInvitation, declineInvitation, loading }}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriendContext = () => useContext(FriendContext);
