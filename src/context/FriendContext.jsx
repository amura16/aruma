import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const FriendContext = createContext();

export const FriendProvider = ({ children }) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 1. RÉCUPÉRATION DES INVITATIONS ---
  const fetchInvitations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          sender:profiles!sender_id (id, username, firstname, lastname, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) {
        if (error.code === '404' || error.message.includes('not found')) {
          setInvitations([]);
          return;
        }
        throw error;
      }

      const formatted = (data || []).map(inv => ({
        id: inv.id,
        sender_id: inv.sender_id,
        name: `${inv.sender?.firstname || 'Inconnu'} ${inv.sender?.lastname || ''}`,
        avatar: inv.sender?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${inv.sender?.username}`,
        created_at: inv.created_at
      }));

      setInvitations(formatted);
    } catch (err) {
      console.error("Erreur fetch invitations:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user]);

  // --- 2. ACCEPTER L'INVITATION (AMITIÉ MUTUELLE) ---
  const acceptInvitation = async (invitation) => {
    try {
      const myId = user.id; // Destinataire (toi)
      const friendId = invitation.sender_id; // Expéditeur (l'autre)

      // Tri des IDs pour respecter la contrainte CHECK (user_id1 < user_id2)
      const [u1, u2] = [myId, friendId].sort();

      // Étape A : Créer l'amitié dans la table 'friends'
      const { error: friendError } = await supabase
        .from('friends')
        .insert([{ user_id1: u1, user_id2: u2 }]);

      // Si déjà amis (erreur de duplication code 23505), on ignore et on continue le nettoyage
      if (friendError && friendError.code !== '23505') throw friendError;

      // Étape B : Supprimer l'invitation avec les conditions spécifiques
      const { error: deleteError } = await supabase
        .from('invitations')
        .delete()
        .eq('sender_id', friendId) // L'utilisateur qui a envoyé
        .eq('receiver_id', myId);  // Toi qui as reçu

      if (deleteError) throw deleteError;

      // Étape C : Mise à jour de l'interface locale
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      
      console.log("Invitation acceptée : Amitié créée et invitation supprimée.");
    } catch (err) {
      console.error("Erreur lors de l'acceptation :", err.message);
    }
  };

  // --- 3. DÉCLINER / SUPPRIMER L'INVITATION ---
  const declineInvitation = async (invitationId) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err) {
      console.error("Erreur lors du refus :", err.message);
    }
  };

  return (
    <FriendContext.Provider 
      value={{ 
        invitations, 
        acceptInvitation, 
        declineInvitation, 
        loading,
        refreshInvitations: fetchInvitations 
      }}
    >
      {children}
    </FriendContext.Provider>
  );
};

export const useFriendContext = () => {
  const context = useContext(FriendContext);
  if (!context) {
    throw new Error("useFriendContext doit être utilisé à l'intérieur d'un FriendProvider");
  }
  return context;
};