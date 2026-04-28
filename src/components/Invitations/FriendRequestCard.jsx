import React from 'react';

const FriendRequestCard = ({ name, mutualFriends, avatar, onAccept, onDecline }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image de profil */}
      <img 
        src={avatar} 
        alt={name} 
        className="w-full h-48 object-cover shadow-inner bg-gray-100" 
      />
      
      <div className="p-4">
        <h4 className="font-bold text-[17px] mb-1 truncate">{name}</h4>
        
        {/* Amis en commun */}
        <div className="flex items-center gap-1 mb-4 h-5">
          {mutualFriends > 0 ? (
            <p className="text-sm text-gray-500">{mutualFriends} ami(s) en commun</p>
          ) : (
            <p className="text-sm text-gray-400">Aucun ami en commun</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={onAccept}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
          >
            Confirmer
          </button>
          <button 
            onClick={onDecline}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 rounded-lg transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestCard;