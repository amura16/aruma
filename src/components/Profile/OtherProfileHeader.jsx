import React, { useState } from 'react';
import { UserPlus, MessageCircle, UserCheck, MoreHorizontal, Camera } from 'lucide-react';

const OtherProfileHeader = ({ user }) => {
  const [isFriend, setIsFriend] = useState(false);

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-[1100px] mx-auto">
        
        {/* --- SECTION COUVERTURE --- */}
        <div className="relative h-[200px] md:h-[380px] bg-gray-200 rounded-b-xl overflow-hidden">
          <img 
            src={user?.cover_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"} 
            className="w-full h-full object-cover" 
            alt="Couverture" 
          />
        </div>

        {/* --- SECTION INFOS & ACTIONS --- */}
        <div className="px-4 pb-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 relative">
            
            {/* Conteneur Avatar : Élévation avec z-index et bordure de séparation */}
            <div className="relative -mt-14 md:-mt-20 z-30"> 
              <div className="p-1.5 bg-white rounded-full shadow-md">
                <img 
                  src={user?.avatar_url} 
                  className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white object-cover bg-gray-50" 
                  alt={user?.name} 
                />
              </div>
            </div>
            
            {/* Texte de profil (Nom et Amis) */}
            <div className="flex-1 text-center md:text-left pt-2">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {user?.name}
              </h1>
              <p className="text-gray-600 font-semibold text-[15px] hover:underline cursor-pointer">
                45 amis en commun
              </p>
            </div>

            {/* Boutons d'interaction (Ajouter / Message) */}
            <div className="flex gap-2 mb-2 w-full md:w-auto mt-4 md:mt-0">
              <button 
                onClick={() => setIsFriend(!isFriend)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition-all duration-200 ${
                  isFriend 
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}
              >
                {isFriend ? <UserCheck size={20} /> : <UserPlus size={20} />}
                <span>{isFriend ? 'Amis' : 'Ajouter'}</span>
              </button>
              
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition-all shadow-sm">
                <MessageCircle size={20} />
                <span>Message</span>
              </button>

              <button className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors">
                <MoreHorizontal size={20} className="text-gray-700" />
              </button>
            </div>

          </div>
        </div>
        
        <hr className="mx-4 border-gray-100" />
        
        {/* Menu de navigation secondaire */}
        <div className="flex gap-1 md:gap-4 px-2 md:px-4 py-1 font-semibold text-gray-600 overflow-x-auto scrollbar-hide">
          <button className="p-3 md:p-4 border-b-4 border-blue-600 text-blue-600 whitespace-nowrap">Publications</button>
          <button className="p-3 md:p-4 hover:bg-gray-100 rounded-lg whitespace-nowrap">À propos</button>
          <button className="p-3 md:p-4 hover:bg-gray-100 rounded-lg whitespace-nowrap">Amis</button>
          <button className="p-3 md:p-4 hover:bg-gray-100 rounded-lg whitespace-nowrap">Photos</button>
          <button className="p-3 md:p-4 hover:bg-gray-100 rounded-lg whitespace-nowrap">Plus</button>
        </div>
      </div>
    </div>
  );
};

export default OtherProfileHeader;