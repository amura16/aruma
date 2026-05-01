import React from 'react';

/**
 * Fonction utilitaire pour formater la date relative
 * Si tu as 'date-fns' installé, tu peux utiliser formatDistanceToNow
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "À l'instant";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `Il y a ${diffInDays} j`;
};

const FriendRequestCard = ({ invitation, onAccept, onDecline }) => {
  // Extraction des données de l'invitation
  const { name, avatar, created_at } = invitation;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image de profil */}
      <img
        src={avatar || "https://via.placeholder.com/150"}
        alt={name}
        className="w-full h-48 object-cover shadow-inner bg-gray-100"
      />

      <div className="p-4">
        <div className="mb-4">
          <h4 className="font-bold text-[17px] truncate leading-tight">{name}</h4>
          {/* Temps de l'invitation */}
          <p className="text-xs text-gray-500 mt-1">
            {formatRelativeTime(created_at)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onAccept(invitation)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition active:scale-[0.98]"
          >
            Confirmer
          </button>
          <button
            onClick={() => onDecline(invitation.id)}
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