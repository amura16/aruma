import React from 'react';
import MediaGrid from './MediaGrid';

const ProfileSidebar = ({ 
  bio, 
  photos = [], 
  videos = [], 
  visibleCount = 9, 
  isOwner = false 
}) => {
  return (
    <aside className="md:col-span-5 space-y-4">
      
      {/* --- SECTION INTRO / BIO --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-3">Intro</h3>
        
        {bio ? (
          <p className="text-center py-2 text-gray-800 text-[15px]">{bio}</p>
        ) : (
          <p className="text-center py-2 text-gray-500 italic">
            {isOwner ? "Aucune bio ajoutée" : "Aucune information disponible"}
          </p>
        )}

        {/* Le bouton ne s'affiche que si l'utilisateur est sur son propre profil */}
        {isOwner && (
          <button className="w-full bg-gray-100 hover:bg-gray-200 font-bold py-2 rounded-lg mt-2 transition duration-200">
            {bio ? "Modifier la bio" : "Ajouter une bio"}
          </button>
        )}
      </div>

      {/* --- GRILLE PHOTOS --- */}
      {photos.length > 0 && (
        <MediaGrid 
          title="Photos" 
          items={photos.slice(0, visibleCount)} 
          type="image" 
        />
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