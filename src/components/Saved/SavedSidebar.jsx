import React from 'react';
import { Bookmark, Video, FileText, Music, Settings, LayoutGrid } from 'lucide-react';

const SavedSidebar = () => {
  const categories = [
    { icon: <LayoutGrid size={20} />, label: "Tout", active: true },
    { icon: <Video size={20} />, label: "Vidéos", active: false },
    { icon: <FileText size={20} />, label: "Articles", active: false },
    { icon: <Music size={20} />, label: "Audio", active: false },
  ];

  return (
    <aside className="hidden lg:flex w-[360px] bg-white border-r border-gray-200 h-full flex-col sticky top-[112px] self-start">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
            <Bookmark size={24} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold">Enregistrements</h2>
        </div>
        <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
          <Settings size={20} />
        </div>
      </div>

      <nav className="flex-1 px-2 mt-2">
        {categories.map((item, index) => (
          <div 
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              item.active ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={item.active ? 'text-purple-600' : 'text-gray-500'}>
              {item.icon}
            </div>
            <span className="font-semibold text-[15px]">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SavedSidebar;