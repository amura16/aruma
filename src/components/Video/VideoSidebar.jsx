import React, { useState } from 'react';
import { PlayCircle, Tv, Clapperboard, Settings } from 'lucide-react';
import SearchBar from '../UI/SearchBar';

const VideoSidebar = ({ onFilterChange }) => {
  // État pour suivre l'onglet actif
  const [activeTab, setActiveTab] = useState("all");

  const menuItems = [
    { id: "all", icon: <Tv size={24} />, label: "Accueil" },
    { id: "live", icon: <PlayCircle size={24} />, label: "Direct" },
    { id: "reels", icon: <Clapperboard size={24} />, label: "Reels" },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // On informe le parent du changement de filtre
    if (onFilterChange) {
      onFilterChange(tabId);
    }
  };

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
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-50 text-blue-600' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={activeTab === item.id ? 'text-blue-600' : 'text-gray-500'}>
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