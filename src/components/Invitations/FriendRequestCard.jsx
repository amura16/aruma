import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFriendsContext } from '../../context/FriendsContext';

/**
 * Carte affichant une demande d'ami reçue.
 * Utilise useFriendsContext pour une synchronisation globale et realtime.
 */
const FriendRequestCard = ({ invitation }) => {
  const navigate = useNavigate();
  const { acceptInvitation, declineInvitation } = useFriendsContext();

  // État local pour un retrait visuel immédiat avant la fin de la requête BDD
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Extraction et Normalisation des données ---
  const id = invitation.id;
  const senderId = invitation.sender_id || invitation.profile?.id;
  const name = invitation.name || "Utilisateur";
  const avatar = invitation.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
  const createdAt = invitation.created_at;

  // Si l'action est en cours, on peut cacher le composant ou afficher un loader
  if (isProcessing) return null;

  const goToProfile = (e) => {
    e.stopPropagation();
    if (senderId) navigate(`/user/${senderId}`);
  };

  const handleAccept = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      // On passe l'objet profil complet pour l'ajouter instantanément à la liste d'amis
      await acceptInvitation(id, invitation.profile);
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error);
      setIsProcessing(false);
    }
  };

  const handleDecline = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await declineInvitation(id);
    } catch (error) {
      console.error("Erreur lors du refus:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">

      {/* SECTION IMAGE / AVATAR */}
      <div
        className="h-48 overflow-hidden bg-gray-100 cursor-pointer group"
        onClick={goToProfile}
      >
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="p-4">
        {/* NOM DE L'UTILISATEUR */}
        <h4
          onClick={goToProfile}
          className="font-bold text-[17px] truncate cursor-pointer hover:text-blue-600 transition-colors"
        >
          {name}
        </h4>

        {/* DATE DE LA DEMANDE */}
        {createdAt && (
          <p className="text-xs text-gray-500 mt-1 italic">
            Demande reçue le {new Date(createdAt).toLocaleDateString()}
          </p>
        )}

        {/* ACTIONS : CONFIRMER OU SUPPRIMER */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 rounded-lg transition active:scale-[0.98] shadow-sm"
          >
            {isProcessing ? 'Traitement...' : 'Confirmer'}
          </button>

          <button
            onClick={handleDecline}
            disabled={isProcessing}
            className="w-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 font-bold py-2 rounded-lg transition active:scale-[0.98]"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestCard;