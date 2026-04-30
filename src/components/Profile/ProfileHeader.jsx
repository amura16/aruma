import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Edit2, UserPlus, UserCheck, 
  MessageCircle, MoreHorizontal, Loader2, X, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFriends } from '../../hooks/useFriends';
import { supabase } from '../../services/supabaseClient';

const ProfileHeader = ({ user, isOwner = false }) => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const { friends = [], loading: friendsLoading } = useFriends();
  const [isFriend, setIsFriend] = useState(false);
  const [uploading, setUploading] = useState({ type: '', status: false });
  const [showFriendsList, setShowFriendsList] = useState(false);
  
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

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const finalUrl = `${publicUrl}?t=${Date.now()}`;
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
        <div className="relative h-[200px] md:h-[380px] bg-gray-200 rounded-b-xl overflow-hidden">
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
        <div className="px-4 pb-6">
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
              <button 
                onClick={() => setShowFriendsList(true)}
                className="text-gray-600 font-bold text-[16px] hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                {friends.length} {friends.length > 1 ? 'amis' : 'ami'}
              </button>
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
      </div>

      {/* --- MODALE : LISTE DES AMIS --- */}
      {showFriendsList && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFriendsList(false)}></div>
          
          <div className="bg-white w-full max-w-[500px] max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users size={24} className="text-blue-600" />
                Liste d'amis ({friends.length})
              </h2>
              <button onClick={() => setShowFriendsList(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {friends.length > 0 ? (
                <div className="space-y-1">
                  {friends.map((friend) => (
                    <div 
                      key={friend.id}
                      onClick={() => { navigate(`/profile`); setShowFriendsList(false); }}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={friend.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${friend.firstname}`} 
                          className="w-12 h-12 rounded-full object-cover" 
                          alt="" 
                        />
                        <span className="font-bold text-gray-900">{friend.firstname} {friend.lastname}</span>
                      </div>
                      <button className="bg-gray-100 px-4 py-1.5 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200">
                        Voir profil
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 italic">
                  Aucun ami à afficher.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
              <button onClick={() => setShowFriendsList(false)} className="text-gray-600 font-bold hover:underline">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;