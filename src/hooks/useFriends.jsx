import { useState, useEffect, useCallback } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [invitations, setInvitations] = useState([]); // Invitations REÇUES (Incoming)
  const [sentRequests, setSentRequests] = useState([]); // Invitations ENVOYÉES (Outgoing)
  const [loading, setLoading] = useState(true);

  // --- 1. RÉCUPÉRER LA LISTE D'AMIS ---
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
        const { data: profiles, error: profError } = await supabase
          .from('profiles')
          .select('id, username, firstname, lastname, avatar_url')
          .in('id', friendIds);

        if (profError) throw profError;
        setFriends(profiles);
      } else {
        setFriends([]);
      }
    } catch (err) {
      console.error("Erreur fetchFriends:", err.message);
    }
  }, [user?.id]);

  // --- 2. RÉCUPÉRER LES INVITATIONS (REÇUES ET ENVOYÉES) ---
  const fetchInvitations = useCallback(async () => {
    if (!user?.id) return;
    try {
      // RÉCUPÉRER LES INVITATIONS REÇUES (Pour le bouton "Répondre")
      const { data: received, error: recError } = await supabase
        .from('invitations')
        .select(`
          id, sender_id, receiver_id, status,
          sender:profiles!sender_id (id, username, firstname, lastname, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (recError) throw recError;

      // RÉCUPÉRER LES INVITATIONS ENVOYÉES (Pour le bouton "En attente")
      const { data: sent, error: sentError } = await supabase
        .from('invitations')
        .select('id, receiver_id, status')
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      setInvitations(received.map(inv => ({
        id: inv.id,
        sender_id: inv.sender_id,
        name: `${inv.sender.firstname} ${inv.sender.lastname}`,
        avatar: inv.sender.avatar_url,
      })));

      setSentRequests(sent);
    } catch (err) {
      console.error("Erreur fetchInvitations:", err.message);
    }
  }, [user?.id]);

  // --- 3. MÉTHODES D'ACTION ---

  const sendRequest = async (receiverId) => {
    // SÉCURITÉ : Vérification de la présence des IDs avant l'insertion
    if (!user?.id || !receiverId) {
      console.error("sendRequest annulé : ID manquant", { sender: user?.id, receiver: receiverId });
      return;
    }

    try {
      const { error } = await supabase
        .from('invitations')
        .insert([{
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        }]);
      if (error) throw error;
    } catch (err) {
      console.error("Erreur sendRequest:", err.message);
    }
  };

  const cancelRequest = async (receiverId) => {
    if (!user?.id || !receiverId) return;
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('sender_id', user.id)
        .eq('receiver_id', receiverId);
      if (error) throw error;
    } catch (err) {
      console.error("Erreur cancelRequest:", err.message);
    }
  };

  const acceptInvitation = async (invitation) => {
    if (!user?.id || !invitation?.sender_id) return;
    try {
      // Contrainte de clé unique SQL user_id1 < user_id2
      const [u1, u2] = [user.id, invitation.sender_id].sort();

      const { error: friendError } = await supabase
        .from('friends')
        .insert([{ user_id1: u1, user_id2: u2 }]);

      if (friendError && friendError.code !== '23505') throw friendError;

      // Supprimer l'invitation
      await supabase.from('invitations').delete().eq('id', invitation.id);
    } catch (err) {
      console.error("Erreur acceptInvitation:", err.message);
    }
  };

  const declineInvitation = async (invitationId) => {
    if (!invitationId) return;
    try {
      const { error } = await supabase.from('invitations').delete().eq('id', invitationId);
      if (error) throw error;
    } catch (err) {
      console.error("Erreur declineInvitation:", err.message);
    }
  };

  const removeFriend = async (friendId) => {
    if (!user?.id || !friendId) return;
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id1.eq.${user.id},user_id2.eq.${friendId}),and(user_id1.eq.${friendId},user_id2.eq.${user.id})`);

      if (error) throw error;
    } catch (err) {
      console.error("Erreur removeFriend:", err.message);
    }
  };

  // --- 4. TEMPS RÉEL ---
  useEffect(() => {
    if (!user?.id) return;

    fetchFriends();
    fetchInvitations();

    const channel = supabase
      .channel('social-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invitations' }, () => fetchInvitations())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends' }, () => {
        fetchFriends();
        fetchInvitations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchFriends, fetchInvitations]);

  return {
    friends,
    invitations,
    sentRequests,
    loading,
    sendRequest,
    cancelRequest,
    acceptInvitation,
    declineInvitation,
    removeFriend
  };
};