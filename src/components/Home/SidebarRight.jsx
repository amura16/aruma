import React from 'react';
import { Video, Search, MoreHorizontal, Plus } from 'lucide-react';

const ContactLine = ({ name, avatar, isOnline }) => (
  <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-xl cursor-pointer transition-all relative group">
    <div className="relative shrink-0">
      <img src={avatar} className="w-9 h-9 rounded-full object-cover" alt={name} />
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
    <span className="font-medium text-[15px] text-gray-800">{name}</span>
  </div>
);

const SidebarRight = () => {
  const contacts = [
    { name: "Inès Bella", seed: "Ines", online: true },
    { name: "Thomas Durant", seed: "Thomas", online: true },
    { name: "Marie Curie", seed: "Marie", online: false },
    { name: "Lucas Malak", seed: "Lucas", online: true },
    { name: "Sophie Fonse", seed: "Sophie", online: true },
  ];

  return (
    <aside className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-[112px] self-start h-[calc(100vh-112px)]">
      <div className="h-full overflow-y-auto custom-scrollbar py-2 px-2">
        <div className="flex justify-between items-center px-2 mb-4 text-gray-600">
          <h3 className="font-bold text-[17px]">Contacts</h3>
          <div className="flex gap-3">
            <Video size={18} className="cursor-pointer hover:bg-gray-200 rounded-full p-1 w-7 h-7" />
            <Search size={18} className="cursor-pointer hover:bg-gray-200 rounded-full p-1 w-7 h-7" />
            <MoreHorizontal size={18} className="cursor-pointer hover:bg-gray-200 rounded-full p-1 w-7 h-7" />
          </div>
        </div>

        <div className="space-y-1">
          {contacts.map((contact, i) => (
            <ContactLine 
              key={i} 
              name={contact.name} 
              avatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.seed}`} 
              isOnline={contact.online} 
            />
          ))}
        </div>

        <hr className="my-4 border-gray-300" />
        <h3 className="px-2 text-gray-500 font-bold text-[16px] mb-2">Conversations de groupe</h3>
        <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-xl cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600"><Plus size={20} /></div>
          <span className="font-medium text-[15px]">Créer un groupe</span>
        </div>
      </div>
    </aside>
  );
};

export default SidebarRight;