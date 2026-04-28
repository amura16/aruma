import React from 'react';
import { PlayCircle, Tv, Clapperboard, Bookmark, Settings, Search } from 'lucide-react';
import SearchBar from '../UI/searchBar';

const VideoSidebar = () => {
  const menuItems = [
    { icon: <Tv size={24} />, label: "Accueil", active: true },
    { icon: <PlayCircle size={24} />, label: "Direct", active: false },
    { icon: <Clapperboard size={24} />, label: "Reels", active: false },
    { icon: <Bookmark size={24} />, label: "Vidéos enregistrées", active: false },
  ];

  return (
    <aside className="hidden lg:flex w-[360px] bg-white border-r border-gray-200 h-full flex-col sticky top-[112px] self-start">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Vidéo</h2>
          <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <Settings size={20} />
          </div>
        </div>
        
        <SearchBar 
          placeholder="Rechercher des vidéos" 
          bgColor="bg-[#F0F2F5]" 
          textSize="text-[15px]" 
          className="mb-4"
        />
      </div>

      <nav className="flex-1 px-2">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              item.active ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={item.active ? 'text-blue-600' : 'text-gray-500'}>
              {item.icon}
            </div>
            <span className="font-semibold text-[15px]">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default VideoSidebar;