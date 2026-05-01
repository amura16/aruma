import { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useFriends = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // --- 1. RÉCUPÉRER LES INVITATIONS EN ATTENTE ---
  const fetchInvitations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          sender:profiles!sender_id (
            id,
            username,
            firstname,
            lastname,
            avatar_url
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      // Formater pour le composant FriendRequestCard
      const formatted = data.map(inv => ({
        id: inv.id,
        sender_id: inv.sender_id,
        name: `${inv.sender.firstname} ${inv.sender.lastname}`,
        avatar: inv.sender.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${inv.sender.username}`,
        mutualFriends: 0 // Logique à implémenter plus tard si besoin
      }));

      setInvitations(formatted);
    } catch (err) {
      console.error("Erreur fetchInvitations:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. ACCEPTER UNE INVITATION (LOGIQUE MUTUELLE) ---
  const acceptInvitation = async (invitation) => {
    try {
      const myId = user.id;
      const friendId = invitation.sender_id;

      // Tri des IDs pour respecter la contrainte CHECK (user_id1 < user_id2)
      const [u1, u2] = [myId, friendId].sort();

      // Étape A : Créer la relation d'amitié
      const { error: friendError } = await supabase
        .from('friends')
        .insert([{ user_id1: u1, user_id2: u2 }]);

      if (friendError) {
        // Si l'erreur est une duplication, on ignore et on continue pour nettoyer l'invitation
        if (friendError.code !== '23505') throw friendError;
      }

      // Étape B : Supprimer l'invitation (on ne la passe plus en 'accepted', on la supprime)
      const { error: deleteError } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitation.id);

      if (deleteError) throw deleteError;

      // Mise à jour locale
      setInvitations(prev => prev.filter(i => i.id !== invitation.id));

      console.log("Invitation acceptée et amitié créée !");
    } catch (err) {
      console.error("Erreur acceptInvitation:", err.message);
      alert("Impossible d'accepter l'invitation.");
    }
  };

  // --- 3. REFUSER / SUPPRIMER UNE INVITATION ---
  const declineInvitation = async (invitationId) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      setInvitations(prev => prev.filter(i => i.id !== invitationId));
    } catch (err) {
      console.error("Erreur declineInvitation:", err.message);
    }
  };

  // --- 4. TEMPS RÉEL & INITIALISATION ---
  useEffect(() => {
    fetchInvitations();

    // S'abonner aux changements de la table invitations pour l'utilisateur actuel
    const channel = supabase
      .channel('invitations-realtime')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitations',
          filter: `receiver_id=eq.${user?.id}`
        },
        () => fetchInvitations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    invitations,
    loading,
    acceptInvitation,
    declineInvitation,
    refreshInvitations: fetchInvitations
  };
};