import { useState, useEffect, useCallback, useRef } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [invitations, setInvitations] = useState([]); // Demandes reçues
  const [sentRequests, setSentRequests] = useState([]); // Demandes envoyées
  const [loading, setLoading] = useState(true);

  // Référence pour garder une trace du canal et éviter les fuites de mémoire
  const channelRef = useRef(null);

  // --- 1. CHARGEMENT DES DONNÉES ---

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
      // Invitations Reçues
      const { data: rec } = await supabase
        .from('invitations')
        .select(`
          id, sender_id, receiver_id, status, created_at,
          sender:profiles!sender_id (id, username, firstname, lastname, avatar_url)
        `)
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
        created_at: inv.created_at
      })) || []);

      setSentRequests(sent || []);
    } catch (err) {
      console.error("Erreur fetchInvitations:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // --- 2. ACTIONS (PROPS) ---

  const sendRequest = async (receiverId) => {
    if (!user?.id || !receiverId) return;
    return await supabase.from('invitations').insert([{ sender_id: user.id, receiver_id: receiverId, status: 'pending' }]);
  };

  const cancelRequest = async (receiverId) => {
    if (!user?.id || !receiverId) return;
    return await supabase.from('invitations').delete().eq('sender_id', user.id).eq('receiver_id', receiverId);
  };

  const acceptInvitation = async (invitationId, senderId) => {
    if (!user?.id || !senderId) return;
    try {
      const [u1, u2] = [user.id, senderId].sort();
      await supabase.from('friends').insert([{ user_id1: u1, user_id2: u2 }]);
      await supabase.from('invitations').delete().eq('id', invitationId);
    } catch (err) { console.error(err.message); }
  };

  const declineInvitation = async (invitationId) => {
    if (!invitationId) return;
    return await supabase.from('invitations').delete().eq('id', invitationId);
  };

  const removeFriend = async (friendId) => {
    if (!user?.id || !friendId) return;
    return await supabase.from('friends').delete()
      .or(`and(user_id1.eq.${user.id},user_id2.eq.${friendId}),and(user_id1.eq.${friendId},user_id2.eq.${user.id})`);
  };

  // --- 3. SYNCHRONISATION TEMPS RÉEL (CORRECTIF FINAL) ---

  useEffect(() => {
    if (!user?.id) return;

    fetchFriends();
    fetchInvitations();

    // Génération d'un ID unique pour éviter les conflits de session
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const channel = supabase.channel(`sync_${user.id}_${uniqueId}`);

    // CONFIGURATION : .on() impérativement AVANT .subscribe()
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitations' },
        () => fetchInvitations()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friends' },
        () => {
          fetchFriends();
          fetchInvitations();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channelRef.current = channel;
        }
      });

    return () => {
      // Nettoyage lors du démontage ou changement d'utilisateur
      if (channel) {
        supabase.removeChannel(channel);
        channelRef.current = null;
      }
    };
  }, [user?.id, fetchFriends, fetchInvitations]);

  return {
    friends, invitations, sentRequests, loading,
    sendRequest, cancelRequest, acceptInvitation, declineInvitation, removeFriend
  };
};