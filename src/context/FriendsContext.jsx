import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
  const { user } = useAuth();

  // États des listes
  const [friends, setFriends] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // État des compteurs et chargement
  const [friendCount, setFriendCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const channelRef = useRef(null);

  // --- 1. RÉCUPÉRATION DU COMPTE TOTAL (Optimisé) ---
  const fetchFriendCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { count, error } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

      if (error) throw error;
      setFriendCount(count || 0);
    } catch (err) {
      console.error("Erreur fetchFriendCount:", err.message);
    }
  }, [user?.id]);

  // --- 2. RÉCUPÉRATION DES DONNÉES DÉTAILLÉES ---
  const fetchFriends = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('user_id1, user_id2, created_at')
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

      if (error) throw error;

      const friendIds = data.map(f => f.user_id1 === user.id ? f.user_id2 : f.user_id1);

      if (friendIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, firstname, lastname, avatar_url')
          .in('id', friendIds);

        // On fusionne la date d'amitié avec le profil pour l'affichage
        const formattedFriends = profiles.map(profile => {
          const relation = data.find(r => r.user_id1 === profile.id || r.user_id2 === profile.id);
          return { ...profile, created_at: relation?.created_at };
        });

        setFriends(formattedFriends || []);
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
      // Invitations Reçues
      const { data: rec } = await supabase
        .from('invitations')
        .select('id, sender_id, receiver_id, status, created_at, sender:profiles!sender_id(id, username, firstname, lastname, avatar_url)')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      // Invitations Envoyées
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
        profile: inv.sender,
        created_at: inv.created_at
      })) || []);

      setSentRequests(sent || []);
    } catch (err) {
      console.error("Erreur fetchInvitations:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // --- 3. ACTIONS SOCIALES ---
  const acceptInvitation = async (invitationId, senderProfile) => {
    if (!user?.id) return;
    try {
      // Mise à jour optimiste
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      setFriends(prev => [...prev, { ...senderProfile, created_at: new Date().toISOString() }]);
      setFriendCount(prev => prev + 1);

      const [u1, u2] = [user.id, senderProfile.id].sort();
      await supabase.from('friends').insert([{ user_id1: u1, user_id2: u2 }]);
      await supabase.from('invitations').delete().eq('id', invitationId);
    } catch (err) {
      fetchFriends();
      fetchFriendCount();
      fetchInvitations();
    }
  };

  const declineInvitation = async (invitationId) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    await supabase.from('invitations').delete().eq('id', invitationId);
  };

  const removeFriend = async (friendId) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
    setFriendCount(prev => Math.max(0, prev - 1));
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

  // --- 4. REALTIME & INITIALISATION ---
  useEffect(() => {
    if (!user?.id) return;

    // Chargement initial
    fetchFriends();
    fetchInvitations();
    fetchFriendCount();

    const uniqueId = Math.random().toString(36).substring(2, 10);
    const channel = supabase.channel(`realtime_social_${user.id}_${uniqueId}`);

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invitations' }, () => fetchInvitations())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends' }, () => {
        fetchFriends();
        fetchFriendCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchFriends, fetchInvitations, fetchFriendCount]);

  return (
    <FriendsContext.Provider value={{
      friends, friendCount, invitations, sentRequests, loading,
      sendRequest, cancelRequest, acceptInvitation, declineInvitation, removeFriend,
      refreshFriendCount: fetchFriendCount // Permet de forcer un refresh si besoin
    }}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriendsContext = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriendsContext doit être utilisé à l'intérieur d'un FriendsProvider");
  }
  return context;
};