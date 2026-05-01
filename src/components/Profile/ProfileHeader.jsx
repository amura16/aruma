import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Edit2, UserPlus, UserCheck, MessageCircle,
  Loader2, X, Users, UserMinus, Clock, Check, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFriends } from '../../hooks/useFriends';
import supabase from '../../services/supabaseClient';

const ProfileHeader = ({ user, isOwner = false }) => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  const {
    friends,
    invitations,    // Invitations reçues (pour "Répondre")
    sentRequests,   // Invitations envoyées (pour "En attente")
    sendRequest,
    cancelRequest,
    acceptInvitation,
    declineInvitation,
    removeFriend
  } = useFriends();

  const [uploading, setUploading] = useState({ type: '', status: false });
  const [showOptions, setShowOptions] = useState(false);

  const optionsRef = useRef(null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // --- ÉTAT DE LA RELATION ---
  const isFriend = friends.some(f => f.id === user?.id);
  const sentRequest = sentRequests.find(r => r.receiver_id === user?.id);
  const incomingRequest = invitations.find(inv => inv.sender_id === user?.id);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- ACTIONS ---
  const handlePrimaryAction = async () => {
    if (isOwner) return;

    // Vérification de sécurité pour éviter l'erreur "receiver_id is null"
    if (!user?.id) {
      console.error("Impossible d'exécuter l'action : l'ID de l'utilisateur est manquant", user);
      return;
    }

    if (!isFriend && !sentRequest && !incomingRequest) {
      console.log("Envoi d'une invitation à :", user.id);
      await sendRequest(user.id);
    } else {
      setShowOptions(!showOptions);
    }
  };

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

        {/* --- SECTION COUVERTURE --- */}
        <div className="relative h-[200px] md:h-[350px] bg-gray-200 rounded-b-xl overflow-hidden">
          <img
            src={user?.cover_url || "https://images.unsplash.com/photo-1557683316-973673baf926"}
            className="w-full h-full object-cover"
            alt="Couverture"
          />
          {isOwner && (
            <button
              onClick={() => coverInputRef.current.click()}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md hover:bg-white transition"
            >
              {uploading.type === 'cover' ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
              <span className="hidden md:inline text-sm">Changer la photo de couverture</span>
            </button>
          )}
          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
        </div>

        {/* --- INFOS & ACTIONS --- */}
        <div className="px-4 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 relative">

            {/* Avatar */}
            <div className="relative -mt-12 md:-mt-16 z-30">
              <div className="p-1 bg-white rounded-full">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white bg-gray-50">
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
                  className="absolute bottom-2 right-2 bg-gray-100 p-2 rounded-full hover:bg-gray-200 border border-white shadow transition"
                >
                  <Camera size={18} />
                </button>
              )}
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
            </div>

            {/* Texte */}
            <div className="flex-1 text-center md:text-left pt-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.firstname} {user?.lastname}
              </h1>
              <span className="text-gray-600 font-semibold">
                {friends.length} {friends.length > 1 ? 'amis' : 'ami'}
              </span>
            </div>

            {/* Boutons d'interaction */}
            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 items-center">
              {isOwner ? (
                <button
                  onClick={() => navigate('/settings')}
                  className="flex-1 md:flex-none bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-300 transition"
                >
                  <Edit2 size={18} /> Modifier le profil
                </button>
              ) : (
                <>
                  <div className="relative flex-1 md:flex-none" ref={optionsRef}>
                    <button
                      onClick={handlePrimaryAction}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition shadow-sm ${isFriend ? 'bg-gray-200 text-gray-800' :
                          incomingRequest ? 'bg-blue-600 text-white' :
                            sentRequest ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-600 text-white'
                        }`}
                    >
                      {isFriend ? <UserCheck size={20} /> :
                        incomingRequest ? <UserPlus size={20} /> :
                          sentRequest ? <Clock size={20} /> : <UserPlus size={20} />}

                      <span>
                        {isFriend ? 'Ami(e)' :
                          incomingRequest ? 'Répondre' :
                            sentRequest ? 'En attente' : 'Ajouter'}
                      </span>
                    </button>

                    {/* Menu contextuel pour les réponses ou annulations */}
                    {showOptions && (
                      <div className="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white shadow-xl border border-gray-100 rounded-lg py-1 z-[60]">

                        {incomingRequest && (
                          <>
                            <button
                              onClick={async () => { await acceptInvitation(incomingRequest); setShowOptions(false); }}
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 font-bold flex items-center gap-2 transition"
                            >
                              <Check size={18} /> Confirmer
                            </button>
                            <button
                              onClick={async () => { await declineInvitation(incomingRequest.id); setShowOptions(false); }}
                              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-bold flex items-center gap-2 transition"
                            >
                              <Trash2 size={18} /> Supprimer
                            </button>
                          </>
                        )}

                        {isFriend && (
                          <button
                            onClick={async () => { await removeFriend(user.id); setShowOptions(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-bold flex items-center gap-2 transition"
                          >
                            <UserMinus size={18} /> Retirer des amis
                          </button>
                        )}

                        {sentRequest && (
                          <button
                            onClick={async () => { await cancelRequest(user.id); setShowOptions(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-bold flex items-center gap-2 transition"
                          >
                            <X size={18} /> Annuler la demande
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/messages?userId=${user.id}`)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
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
    </div>
  );
};

export default ProfileHeader;