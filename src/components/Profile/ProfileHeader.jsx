import React, { useState } from 'react';
import { 
  Camera, Edit2, UserPlus, UserCheck, 
  MessageCircle, MoreHorizontal 
} from 'lucide-react';

const ProfileHeader = ({ user, isOwner = false }) => {
  const [isFriend, setIsFriend] = useState(false);

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-[1100px] mx-auto">
        
        {/* --- SECTION COUVERTURE --- */}
        <div className="relative h-[200px] md:h-[380px] bg-gray-200 rounded-b-xl overflow-hidden group">
          <img 
            src={user?.cover_url || "https://images.unsplash.com/photo-1557683316-973673baf926"} 
            className="w-full h-full object-cover" 
            alt="Couverture" 
          />
          {isOwner && (
            <button className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg flex items-center gap-2 font-semibold shadow-md hover:bg-gray-100 transition z-10">
              <Camera size={20} /> 
              <span className="hidden md:inline">Changer la photo de couverture</span>
            </button>
          )}
        </div>

        {/* --- SECTION INFOS & ACTIONS --- */}
        <div className="px-4 pb-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 relative">
            
            {/* Conteneur Avatar : On utilise z-index et bordure pour éviter qu'il soit coupé */}
            <div className="relative -mt-16 md:-mt-20 z-30"> 
              <div className="p-1.5 bg-white rounded-full shadow-md">
                <img 
                  src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstname || 'ArumA'}`} 
                  className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white object-cover bg-gray-50" 
                  alt={user?.firstname} 
                />
              </div>
              {isOwner && (
                <button className="absolute bottom-4 right-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300 border-2 border-white shadow-sm transition-transform active:scale-95">
                  <Camera size={20} />
                </button>
              )}
            </div>
            
            {/* Texte de profil */}
            <div className="flex-1 text-center md:text-left pt-2">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {user ? `${user.firstname} ${user.lastname}` : "Utilisateur ArumA"}
              </h1>
              <p className="text-gray-600 font-semibold text-[15px] hover:underline cursor-pointer">
                {isOwner ? "1.2k amis" : "45 amis en commun"}
              </p>
            </div>

            {/* Boutons d'actions (Conditionnels) */}
            <div className="flex gap-2 mb-2 w-full md:w-auto mt-4 md:mt-0">
              {isOwner ? (
                /* Vue pour le propriétaire */
                <button className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-sm">
                  <Edit2 size={18} /> Modifier le profil
                </button>
              ) : (
                /* Vue pour un visiteur */
                <>
                  <button 
                    onClick={() => setIsFriend(!isFriend)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                      isFriend 
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    {isFriend ? <UserCheck size={20} /> : <UserPlus size={20} />}
                    <span>{isFriend ? 'Amis' : 'Ajouter'}</span>
                  </button>
                  
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition shadow-sm">
                    <MessageCircle size={20} />
                    <span>Message</span>
                  </button>

                  <button className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors">
                    <MoreHorizontal size={20} className="text-gray-700" />
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
        
        <hr className="mx-4 border-gray-100" />
        
        {/* Menu de navigation (Onglets) */}
        <div className="flex gap-1 md:gap-4 px-2 md:px-4 py-1 font-semibold text-gray-600 overflow-x-auto scrollbar-hide">
          <button className="p-3 md:p-4 border-b-4 border-blue-600 text-blue-600 whitespace-nowrap">Publications</button>
          <button className="p-3 md:p-4 hover:bg-gray-100 rounded-lg whitespace-nowrap">À propos</button>
          <button className="p-3 md:p-4 hover:bg-gray-100 rounded-lg whitespace-nowrap">Amis</button>
          <button className="p-3 md:p-4 hover:bg-gray-100 rounded-lg whitespace-nowrap">Photos</button>
          <button className="p-3 md:p-4 hover:bg-gray-100 rounded-lg whitespace-nowrap">Vidéos</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;