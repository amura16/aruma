import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFriends } from '../../hooks/useFriends';

/**
 * Carte affichant une demande d'ami reçue.
 * Utilise les méthodes du hook useFriends pour une gestion centralisée et realtime.
 */
const FriendRequestCard = ({ invitation }) => {
  const navigate = useNavigate();
  const { acceptInvitation, declineInvitation } = useFriends();

  // ----------------------------
  // 🛠️ NORMALISATION DES DONNÉES
  // ----------------------------
  // On s'assure de récupérer les bonnes propriétés peu importe le format de l'objet
  const id = invitation.id;
  const senderId = invitation.sender_id || invitation.user_id;
  const name = invitation.name || "Utilisateur";
  const avatar = invitation.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
  const createdAt = invitation.created_at;

  // ----------------------------
  // 👤 NAVIGATION
  // ----------------------------
  const goToProfile = (e) => {
    e.stopPropagation();
    if (senderId) navigate(`/user/${senderId}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      {/* IMAGE DE PROFIL / AVATAR */}
      <div className="h-48 overflow-hidden bg-gray-100 cursor-pointer" onClick={goToProfile}>
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
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

        {/* DATE DE LA DEMANDE (Optionnel) */}
        {createdAt && (
          <p className="text-xs text-gray-500 mt-1">
            Demande reçue le {new Date(createdAt).toLocaleDateString()}
          </p>
        )}

        {/* ACTIONS : CONFIRMER OU SUPPRIMER */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              acceptInvitation(id, senderId); // Appelle la logique du hook
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition active:scale-[0.98] shadow-sm"
          >
            Confirmer
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              declineInvitation(id); // Appelle la logique du hook
            }}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 rounded-lg transition active:scale-[0.98]"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestCard;