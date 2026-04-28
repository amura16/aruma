import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

const PostCard = ({ user, content, image, time }) => {
  // Fonction de secours pour formater la date si ce n'est pas déjà fait
  const formatTime = (date) => {
    if (!date) return "À l'instant";
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return `Il y a ${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return postDate.toLocaleDateString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">
      {/* Header du post */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-1 ring-gray-100">
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
              className="w-full h-full object-cover" 
              alt="avatar" 
            />
          </div>
          <div>
            <h4 className="font-bold text-[14px] hover:underline cursor-pointer">
              {user?.name || "Utilisateur ArumA"}
            </h4>
            <p className="text-[12px] text-gray-500 font-medium">
              {formatTime(time)}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Contenu texte */}
      <div className="px-4 pb-3">
        <p className="text-[#050505] text-[15px] leading-snug">
          {content}
        </p>
      </div>

      {/* Image du post */}
      {image && (
        <div className="border-y border-gray-100 bg-gray-50">
          <img src={image} alt="Post content" className="w-full h-auto max-h-[500px] object-contain mx-auto" />
        </div>
      )}

      {/* Actions (Like, Comment, Share) */}
      <div className="px-4 py-1 border-t border-gray-100 mt-2 flex items-center justify-between">
        <div className="flex w-full">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-md transition">
            <Heart size={20} /> Like
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-md transition">
            <MessageCircle size={20} /> Commenter
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-md transition">
            <Share2 size={20} /> Partager
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;