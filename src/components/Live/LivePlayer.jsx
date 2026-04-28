import React from 'react';
import { Users, Eye, Share2, Heart } from 'lucide-react';

const LivePlayer = ({ streamTitle, streamer }) => {
  return (
    <div className="flex-1 bg-black flex flex-col relative">
      {/* Player Vidéo */}
      <div className="relative flex-1 flex items-center justify-center group">
        <video 
          className="w-full h-full max-h-[calc(100vh-250px)] object-contain"
          poster="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000"
          autoPlay
          muted
        >
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
        </video>

        {/* Overlay Infos */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase animate-pulse">
            En Direct
          </div>
          <div className="bg-black/50 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
            <Eye size={14} /> 1.2k
          </div>
        </div>
      </div>

      {/* Barre d'infos Streamer */}
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={streamer.avatar} className="w-12 h-12 rounded-full border-2 border-red-500 p-0.5" alt="" />
            <div>
              <h1 className="font-bold text-lg leading-tight">{streamTitle}</h1>
              <p className="text-sm text-gray-600 font-medium">{streamer.name}</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-bold transition">
              <Share2 size={20} /> Partager
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold transition">
              <Heart size={20} /> Soutenir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePlayer;