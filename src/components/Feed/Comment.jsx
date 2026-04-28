import React from 'react';

const Comment = ({ user, text, time }) => {
  return (
    <div className="flex gap-2 mb-3">
      {/* Avatar petit */}
      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer">
        <img 
          src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
          alt="avatar" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col">
        {/* Bulle de commentaire */}
        <div className="bg-gray-100 px-3 py-2 rounded-2xl">
          <h5 className="text-[13px] font-bold hover:underline cursor-pointer">
            {user?.name || "Utilisateur"}
          </h5>
          <p className="text-[14px] text-gray-900 leading-snug">
            {text}
          </p>
        </div>

        {/* Actions sous la bulle */}
        <div className="flex gap-4 ml-2 mt-1">
          <button className="text-[12px] font-bold text-gray-500 hover:underline">J'aime</button>
          <button className="text-[12px] font-bold text-gray-500 hover:underline">Répondre</button>
          <span className="text-[12px] text-gray-400">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default Comment;