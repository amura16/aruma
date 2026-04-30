import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Reply = ({ user, text, time, onReply }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  // Fonction pour déclencher la réponse
  const handleReplyAction = () => {
    if (onReply) {
      // On passe le nom de l'utilisateur pour pouvoir faire une mention "@Nom"
      onReply(user?.name);
    }
  };

  return (
    <div className="flex gap-2 mt-2 ml-10 group">
      {/* Avatar avec redirection */}
      <div
        onClick={() => navigate('/profile')}
        className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition"
      >
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col max-w-[90%]">
        {/* Bulle de la réponse */}
        <div className="bg-gray-100 px-3 py-1.5 rounded-2xl relative">
          <h5
            onClick={() => navigate('/profile')}
            className="text-[12px] font-bold hover:underline cursor-pointer text-gray-900"
          >
            {user?.name}
          </h5>
          <p className="text-[13px] text-gray-900 leading-tight">
            {text}
          </p>

          {/* Badge Like discret */}
          {isLiked && (
            <div className="absolute -right-2 -bottom-1 bg-white shadow-sm border border-gray-50 rounded-full p-0.5">
              <div className="bg-blue-500 rounded-full p-0.5 text-[8px] text-white">👍</div>
            </div>
          )}
        </div>

        {/* Actions sous la bulle */}
        <div className="flex gap-3 ml-2 mt-0.5 items-center">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`text-[11px] font-bold hover:underline transition-colors ${isLiked ? 'text-blue-600' : 'text-gray-500'
              }`}
          >
            {isLiked ? "Aimé" : "J'aime"}
          </button>

          {/* Nouvelle Action Répondre */}
          <button
            onClick={handleReplyAction}
            className="text-[11px] font-bold text-gray-500 hover:underline"
          >
            Répondre
          </button>

          <span className="text-[11px] text-gray-400 font-normal">
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Reply;