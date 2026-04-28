import React from 'react';
import { MessageCircle, Share2, ThumbsUp, MoreHorizontal } from 'lucide-react';

const VideoCard = ({ author, title, videoUrl, time, views }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={author.avatar} className="w-10 h-10 rounded-full object-cover" alt={author.name} />
          <div>
            <h4 className="font-bold text-[15px] hover:underline cursor-pointer">{author.name}</h4>
            <p className="text-[12px] text-gray-500">{time} • {views} vues</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full"><MoreHorizontal size={20}/></button>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-[15px] text-gray-800">{title}</p>
      </div>

      {/* Player Vidéo */}
      <div className="bg-black w-full aspect-video flex items-center justify-center">
        <video 
          controls 
          className="w-full h-full max-h-[500px]"
          poster="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000"
        >
          <source src={videoUrl} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
        <div className="flex w-full">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-md transition">
            <ThumbsUp size={20} /> J'aime
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

export default VideoCard;