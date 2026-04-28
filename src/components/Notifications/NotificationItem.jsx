import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const NotificationItem = ({ user, action, target, time, isRead, avatar }) => {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-100 group ${!isRead ? 'bg-blue-50' : 'bg-white'}`}>
      {/* Avatar avec pastille de statut */}
      <div className="relative shrink-0">
        <img src={avatar} className="w-14 h-14 rounded-full object-cover" alt={user} />
        <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-full border-2 border-white">
          {/* Tu peux changer l'icône ici selon le type (Like, Comment, etc.) */}
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Contenu du texte */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] leading-snug">
          <span className="font-bold">{user}</span> {action} 
          <span className="font-semibold"> {target}</span>
        </p>
        <p className={`text-[13px] mt-1 ${!isRead ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
          {time}
        </p>
      </div>

      {/* Indicateur de lecture et Options */}
      <div className="flex items-center gap-2">
        {!isRead && (
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
        )}
        <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full transition-all">
          <MoreHorizontal size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;