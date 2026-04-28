import React from 'react';
import { Users, UserPlus, UserCheck, Settings } from 'lucide-react';

const InvitationsSidebar = () => {
  const menuItems = [
    { icon: <Users size={24} />, label: "Accueil", active: true },
    { icon: <UserPlus size={24} />, label: "Invitations", active: false },
    { icon: <UserCheck size={24} />, label: "Suggestions", active: false },
    { icon: <Users size={24} />, label: "Tous les amis", active: false },
  ];

  return (
    <aside className="w-full lg:w-[360px] bg-white border-r border-gray-200 h-full flex flex-col sticky top-[112px]">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Amis</h2>
        <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
          <Settings size={20} className="text-gray-600" />
        </div>
      </div>

      <nav className="flex-1 px-2">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              item.active ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`${item.active ? 'text-blue-600' : 'text-gray-500'}`}>
              {item.icon}
            </div>
            <span className="font-semibold text-[15px]">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default InvitationsSidebar;