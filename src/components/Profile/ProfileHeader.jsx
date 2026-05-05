import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Edit2, UserPlus, UserCheck, MessageCircle,
  Loader2, X, UserMinus, Clock, Check, Trash2
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useFriendsContext } from '../../context/FriendsContext';
import supabase from '../../services/supabaseClient';
import FriendsListModal from './FriendsListModal';
import EditProfileModal from './EditProfileModal';

const ProfileHeader = ({ user, isOwner = false }) => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  // Données sociales issues du contexte global
  const {
    friends: myFriends,
    friendCount: myGlobalCount,
    invitations,
    sentRequests,
    sendRequest,
    cancelRequest,
    acceptInvitation,
    declineInvitation,
    removeFriend
  } = useFriendsContext();

  // États locaux
  const [uploading, setUploading] = useState({ type: '', status: false });
  const [showOptions, setShowOptions] = useState(false);
  const [displayFriendCount, setDisplayFriendCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const optionsRef = useRef(null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Déterminer la relation actuelle
  const isFriend = myFriends.some(f => f.id === user?.id);
  const sentRequest = sentRequests.find(r => r.receiver_id === user?.id);
  const incomingRequest = invitations.find(inv => inv.sender_id === user?.id);

  // Gestion du compteur d'amis (synchronisé ou récupéré via API)
  useEffect(() => {
    if (isOwner) {
      setDisplayFriendCount(myGlobalCount);
      return;
    }

    const fetchTargetFriendCount = async () => {
      if (!user?.id) return;
      try {
        const { count, error } = await supabase
          .from('friends')
          .select('*', { count: 'exact', head: true })
          .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

        if (!error) setDisplayFriendCount(count || 0);
      } catch (err) {
        console.error("Erreur compteur:", err);
      }
    };

    fetchTargetFriendCount();
  }, [user?.id, isOwner, myGlobalCount, isFriend]);

  // Fermeture du menu d'options au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gestion des uploads (Avatar / Cover)
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading({ type, status: true });
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${type}-${Math.random()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const field = type === 'avatar' ? 'avatar_url' : 'cover_url';

      await updateProfile({ [field]: `${publicUrl}?t=${Date.now()}` });
    } catch (err) {
      console.error(`Erreur upload ${type}:`, err);
    } finally {
      setUploading({ type: '', status: false });
    }
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-[1100px] mx-auto">

        {/* --- BANNIÈRE DE COUVERTURE --- */}
        <div className="relative h-[200px] md:h-[350px] bg-gray-200 rounded-b-xl overflow-hidden group">
          <img
            src={user?.cover_url || "https://images.unsplash.com/photo-1557683316-973673baf926"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt="Couverture"
          />
          {isOwner && (
            <button
              onClick={() => coverInputRef.current.click()}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md hover:bg-white transition-all active:scale-95"
            >
              {uploading.type === 'cover' ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
              <span className="hidden md:inline text-sm">Changer la photo de couverture</span>
            </button>
          )}
          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
        </div>

        {/* --- ZONE INFOS & ACTIONS --- */}
        <div className="px-4 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 relative">

            {/* Avatar circulaire */}
            <div className="relative -mt-12 md:-mt-16 z-30">
              <div className="p-1 bg-white rounded-full shadow-lg">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white bg-gray-100">
                  <img
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstname}`}
                    className="w-full h-full object-cover"
                    alt={user?.firstname}
                  />
                </div>
              </div>
              {isOwner && (
                <button
                  onClick={() => avatarInputRef.current.click()}
                  className="absolute bottom-2 right-2 bg-gray-100 p-2 rounded-full hover:bg-gray-200 border border-white shadow-lg transition-transform hover:scale-110"
                >
                  <Camera size={20} />
                </button>
              )}
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
            </div>

            {/* Identité & Compteur d'amis cliquable */}
            <div className="flex-1 text-center md:text-left pt-2">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {user?.firstname} {user?.lastname}
              </h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-600 font-semibold hover:text-blue-600 hover:underline decoration-2 underline-offset-4 transition-all cursor-pointer"
              >
                {displayFriendCount} {displayFriendCount > 1 ? 'amis' : 'ami'}
              </button>
            </div>

            {/* Boutons d'interaction sociale */}
            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 items-center">
              {isOwner ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 md:flex-none bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
                >
                  <Edit2 size={18} /> Modifier le profil
                </button>
              ) : (
                <>
                  {/* Bouton d'amitié dynamique */}
                  <div className="relative flex-1 md:flex-none" ref={optionsRef}>
                    <button
                      onClick={() => !isFriend && !sentRequest && !incomingRequest ? sendRequest(user.id) : setShowOptions(!showOptions)}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-sm ${isFriend ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' :
                        incomingRequest ? 'bg-blue-600 text-white hover:bg-blue-700' :
                          sentRequest ? 'bg-amber-100 text-amber-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {isFriend ? <UserCheck size={20} /> : <UserPlus size={20} />}
                      <span>
                        {isFriend ? 'Ami(e)' : incomingRequest ? 'Répondre' : sentRequest ? 'En attente' : 'Ajouter'}
                      </span>
                    </button>

                    {/* Menu déroulant pour gérer la relation */}
                    {showOptions && (
                      <div className="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white shadow-2xl border border-gray-100 rounded-xl py-2 z-[60] animate-in fade-in slide-in-from-top-2">
                        {incomingRequest && (
                          <>
                            <button
                              onClick={async () => { await acceptInvitation(incomingRequest.id, user); setShowOptions(false); }}
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 font-bold flex items-center gap-3 transition-colors"
                            >
                              <Check size={18} className="bg-blue-100 p-0.5 rounded-full" /> Confirmer l'invitation
                            </button>
                            <button
                              onClick={async () => { await declineInvitation(incomingRequest.id); setShowOptions(false); }}
                              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-bold flex items-center gap-3 transition-colors"
                            >
                              <Trash2 size={18} className="bg-red-100 p-0.5 rounded-full" /> Supprimer la demande
                            </button>
                          </>
                        )}
                        {isFriend && (
                          <button
                            onClick={async () => { if (window.confirm("Retirer cet ami ?")) await removeFriend(user.id); setShowOptions(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-bold flex items-center gap-3 transition-colors"
                          >
                            <UserMinus size={18} className="bg-red-100 p-0.5 rounded-full" /> Retirer des amis
                          </button>
                        )}
                        {sentRequest && (
                          <button
                            onClick={async () => { await cancelRequest(user.id); setShowOptions(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-bold flex items-center gap-3 transition-colors"
                          >
                            <X size={18} className="bg-gray-200 p-0.5 rounded-full" /> Annuler la demande
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* BOUTON MESSAGE FONCTIONNEL */}
                  <button
                    onClick={() => navigate(`/message?userId=${user.id}`)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
                  >
                    <MessageCircle size={20} />
                    <span>Message</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modale de la liste d'amis (Layout avec liste cliquable) */}
      <FriendsListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user?.id}
        userName={user?.firstname}
      />
      {/* Modale de modification de profil */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default ProfileHeader;