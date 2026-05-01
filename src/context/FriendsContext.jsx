import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  // --- 1. RÉCUPÉRATION DES DONNÉES ---
  const fetchFriends = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('user_id1, user_id2')
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

      if (error) throw error;
      const friendIds = data.map(f => f.user_id1 === user.id ? f.user_id2 : f.user_id1);

      if (friendIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, firstname, lastname, avatar_url')
          .in('id', friendIds);
        setFriends(profiles || []);
      } else {
        setFriends([]);
      }
    } catch (err) {
      console.error("Erreur fetchFriends:", err.message);
    }
  }, [user?.id]);

  const fetchInvitations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data: rec } = await supabase
        .from('invitations')
        .select('id, sender_id, receiver_id, status, created_at, sender:profiles!sender_id(id, username, firstname, lastname, avatar_url)')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      const { data: sent } = await supabase
        .from('invitations')
        .select('id, receiver_id, status')
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      setInvitations(rec?.map(inv => ({
        id: inv.id,
        sender_id: inv.sender_id,
        name: `${inv.sender.firstname} ${inv.sender.lastname}`,
        avatar: inv.sender.avatar_url,
        profile: inv.sender, // Objet complet pour l'ajout immédiat à la liste d'amis
        created_at: inv.created_at
      })) || []);

      setSentRequests(sent || []);
    } catch (err) {
      console.error("Erreur fetchInvitations:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // --- 2. ACTIONS AVEC MISE À JOUR OPTIMISTE (Realtime UI) ---
  const acceptInvitation = async (invitationId, senderProfile) => {
    if (!user?.id) return;
    try {
      // Étape 1 : Mise à jour immédiate de l'interface
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      setFriends(prev => [...prev, senderProfile]);

      // Étape 2 : Persistance en base de données
      const [u1, u2] = [user.id, senderProfile.id].sort();
      await supabase.from('friends').insert([{ user_id1: u1, user_id2: u2 }]);
      await supabase.from('invitations').delete().eq('id', invitationId);
    } catch (err) {
      console.error("Échec de l'acceptation:", err.message);
      // Rollback en cas d'erreur
      fetchFriends();
      fetchInvitations();
    }
  };

  const declineInvitation = async (invitationId) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    await supabase.from('invitations').delete().eq('id', invitationId);
  };

  const removeFriend = async (friendId) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
    await supabase.from('friends').delete()
      .or(`and(user_id1.eq.${user.id},user_id2.eq.${friendId}),and(user_id1.eq.${friendId},user_id2.eq.${user.id})`);
  };

  const sendRequest = async (receiverId) => {
    await supabase.from('invitations').insert([{ sender_id: user.id, receiver_id: receiverId, status: 'pending' }]);
  };

  const cancelRequest = async (receiverId) => {
    setSentRequests(prev => prev.filter(req => req.receiver_id !== receiverId));
    await supabase.from('invitations').delete().eq('sender_id', user.id).eq('receiver_id', receiverId);
  };

  // --- 3. GESTION DU REALTIME ---
  useEffect(() => {
    if (!user?.id) return;

    fetchFriends();
    fetchInvitations();

    const uniqueId = Math.random().toString(36).substring(2, 10);
    const channel = supabase.channel(`realtime_social_${user.id}_${uniqueId}`);

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invitations' }, () => fetchInvitations())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends' }, () => fetchFriends())
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') channelRef.current = channel;
      });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id, fetchFriends, fetchInvitations]);

  return (
    <FriendsContext.Provider value={{
      friends, invitations, sentRequests, loading,
      sendRequest, cancelRequest, acceptInvitation, declineInvitation, removeFriend
    }}>
      {children}
    </FriendsContext.Provider>
  );
};

// EXPORT RENOMMÉ POUR ÉVITER TOUTE CONFUSION
export const useFriendsContext = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriendsContext doit être utilisé à l'intérieur d'un FriendsProvider");
  }
  return context;
};