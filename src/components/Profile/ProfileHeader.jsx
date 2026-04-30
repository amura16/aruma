import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Edit2, UserPlus, UserCheck, 
  MessageCircle, MoreHorizontal, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const ProfileHeader = ({ user, isOwner = false }) => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [isFriend, setIsFriend] = useState(false);
  const [uploading, setUploading] = useState({ type: '', status: false });
  
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading({ type, status: true });
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${type}-${Math.random()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // 1. Upload
      const { error: uploadError } = await supabase.storage
        .from('avatars') // On réutilise le bucket avatars ou profiles
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const finalUrl = `${publicUrl}?t=${Date.now()}`;

      // 3. Update DB
      const field = type === 'avatar' ? 'avatar_url' : 'cover_url';
      await updateProfile({ [field]: finalUrl });

    } catch (err) {
      console.error(`Erreur upload ${type}:`, err);
    } finally {
      setUploading({ type: '', status: false });
    }
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-[1100px] mx-auto">
        
        {/* --- SECTION COUVERTURE --- */}
        <div className="relative h-[200px] md:h-[380px] bg-gray-200 rounded-b-xl overflow-hidden group">
          <img 
            src={user?.cover_url || "https://images.unsplash.com/photo-1557683316-973673baf926"} 
            className={`w-full h-full object-cover transition-opacity ${uploading.type === 'cover' ? 'opacity-50' : 'opacity-100'}`} 
            alt="Couverture" 
          />
          {isOwner && (
            <>
              <button 
                onClick={() => coverInputRef.current.click()}
                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg flex items-center gap-2 font-semibold shadow-md hover:bg-white transition z-10 active:scale-95"
              >
                {uploading.type === 'cover' ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />} 
                <span className="hidden md:inline">Changer la photo de couverture</span>
              </button>
              <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
            </>
          )}
        </div>

        {/* --- SECTION INFOS & ACTIONS --- */}
        <div className="px-4 pb-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 relative">
            
            {/* Conteneur Avatar */}
            <div className="relative -mt-16 md:-mt-20 z-30"> 
              <div className="p-1.5 bg-white rounded-full shadow-md">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white bg-gray-50 relative">
                  <img 
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstname}`} 
                    className={`w-full h-full object-cover transition-opacity ${uploading.type === 'avatar' ? 'opacity-50' : 'opacity-100'}`} 
                    alt={user?.firstname} 
                  />
                  {uploading.type === 'avatar' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                  )}
                </div>
              </div>
              {isOwner && (
                <>
                  <button 
                    onClick={() => avatarInputRef.current.click()}
                    className="absolute bottom-4 right-4 bg-gray-100 p-2.5 rounded-full hover:bg-gray-200 border-2 border-white shadow-lg transition-transform active:scale-95"
                  >
                    <Camera size={20} />
                  </button>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                </>
              )}
            </div>
            
            {/* Texte de profil */}
            <div className="flex-1 text-center md:text-left pt-2">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {user ? `${user.firstname} ${user.lastname}` : "Chargement..."}
              </h1>
              <p className="text-gray-600 font-semibold text-[15px] hover:underline cursor-pointer">
                {isOwner ? "Gérer mon profil" : "1.2k amis"}
              </p>
            </div>

            {/* Boutons d'actions */}
            <div className="flex gap-2 mb-2 w-full md:w-auto mt-4 md:mt-0">
              {isOwner ? (
                <button 
                  onClick={() => navigate('/setting')}
                  className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-md active:scale-95"
                >
                  <Edit2 size={18} /> Modifier le profil
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setIsFriend(!isFriend)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                      isFriend ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white shadow-sm'
                    }`}
                  >
                    {isFriend ? <UserCheck size={20} /> : <UserPlus size={20} />}
                    <span>{isFriend ? 'Amis' : 'Ajouter'}</span>
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition">
                    <MessageCircle size={20} />
                    <span>Message</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <hr className="mx-4 border-gray-100" />
        
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