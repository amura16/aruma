import React, { useState } from 'react';
import MediaGrid from './MediaGrid';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Save, X } from 'lucide-react';

const ProfileSidebar = ({ 
  user,
  photos = [], 
  videos = [], 
  visibleCount = 9, 
  isOwner = false 
}) => {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSaveBio = async () => {
    setLoading(true);
    try {
      await updateProfile({ bio: bioText });
      setIsEditing(false);
    } catch (err) {
      console.error("Erreur bio:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="md:col-span-5 space-y-4">
      
      {/* --- SECTION INTRO / BIO --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-3">Intro</h3>
        
        {isEditing ? (
          <div className="space-y-3">
            <textarea 
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Décrivez-vous..."
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-[15px]"
              maxLength={150}
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSaveBio}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Enregistrer
              </button>
              <button 
                onClick={() => { setIsEditing(false); setBioText(user?.bio || ''); }}
                className="px-4 bg-gray-100 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {user?.bio ? (
              <p className="text-center py-2 text-gray-800 text-[15px] whitespace-pre-wrap">{user.bio}</p>
            ) : (
              <p className="text-center py-2 text-gray-500 italic">
                {isOwner ? "Ajoutez une bio pour vous présenter" : "Aucune information disponible"}
              </p>
            )}

            {isOwner && (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full bg-gray-100 hover:bg-gray-200 font-bold py-2 rounded-lg mt-2 transition duration-200"
              >
                {user?.bio ? "Modifier la bio" : "Ajouter une bio"}
              </button>
            )}
          </>
        )}
      </div>

      {/* --- GRILLE PHOTOS --- */}
      {photos.length > 0 ? (
        <MediaGrid 
          title="Photos" 
          items={photos.slice(0, visibleCount)} 
          type="image" 
        />
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-3">Photos</h3>
          <p className="text-gray-500 text-sm text-center py-4">Aucune photo publiée</p>
        </div>
      )}

      {/* --- GRILLE VIDÉOS --- */}
      {videos.length > 0 && (
        <MediaGrid 
          title="Vidéos" 
          items={videos.slice(0, visibleCount)} 
          type="video" 
        />
      )}
      
    </aside>
  );
};

export default ProfileSidebar;