import React from 'react';
import { Users, Video, Bookmark, Settings } from 'lucide-react';

const SidebarLink = ({ icon, label, img }) => (
  <div className="flex items-center gap-3 p-3 hover:bg-gray-200 rounded-xl cursor-pointer transition-all duration-200">
    <div className="w-9 h-9 flex items-center justify-center shrink-0">
      {img ? (
        <img src={img} className="w-full h-full rounded-full object-cover" alt={label} />
      ) : (
        React.cloneElement(icon, { size: 24 })
      )}
    </div>
    <span className="font-medium text-[15px] text-gray-800 tracking-tight">{label}</span>
  </div>
);

const InvitationCard = ({ name, mutualFriends, avatar }) => (
  <div className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 mb-2">
    <div className="flex gap-3 mb-2">
      <img src={avatar} className="w-12 h-12 rounded-full object-cover shrink-0" alt={name} />
      <div className="flex flex-col">
        <span className="font-bold text-[14px] leading-tight">{name}</span>
        <span className="text-[12px] text-gray-500">{mutualFriends} ami(s) en commun</span>
      </div>
    </div>
    <div className="flex gap-2">
      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition">Confirmer</button>
      <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold py-2 rounded-lg transition">Supprimer</button>
    </div>
  </div>
);

const SidebarLeft = () => {
  return (
    <aside className="hidden lg:block lg:col-span-3 sticky top-[112px] self-start h-[calc(100vh-112px)]">
      <div className="h-full overflow-y-auto pr-2 custom-scrollbar py-2">
        <SidebarLink img="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" label="Felix Dev" />
        <SidebarLink icon={<Users className="text-blue-500" />} label="Amis" />
        <SidebarLink icon={<Video className="text-red-500" />} label="Vidéo live" />
        <SidebarLink icon={<Bookmark className="text-purple-500" />} label="Enregistrement" />
        <SidebarLink icon={<Settings className="text-gray-600" />} label="Paramètres" />
        
        <hr className="my-4 border-gray-300 mx-2" />
        
        <div className="px-2 mb-4 flex justify-between items-center text-gray-500 font-bold text-[16px]">
          <h3>Invitations</h3>
          <button className="text-blue-600 text-xs font-normal hover:underline">Voir tout</button>
        </div>
        <InvitationCard name="Sonia Rakoto" mutualFriends="12" avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia" />
        <InvitationCard name="Jean Marc" mutualFriends="3" avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Marc" />
      </div>
    </aside>
  );
};

export default SidebarLeft;