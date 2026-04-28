import React from 'react';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import PostCard from '../components/Feed/PostCard';

const Profile = () => {
  // 1. Définir les données qui manquent
  const currentUser = {
    name: "Felix Dev",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    cover_url: "https://images.unsplash.com/photo-1557683316-973673baf926"
  };

  // Ce sont ces variables qui causaient l'erreur "not defined"
  const userPhotos = [
    { url: "https://picsum.photos/400/400?random=1" },
    { url: "https://picsum.photos/400/400?random=2" },
    { url: "https://picsum.photos/400/400?random=3" },
  ];

  const userVideos = [
    { url: "https://www.w3schools.com/html/mov_bbb.mp4" },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <ProfileHeader user={currentUser} isOwner={true} />

      <main className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 px-4">
        
        {/* 2. Utilisation du composant avec les variables définies au-dessus */}
        <ProfileSidebar 
          bio="Développeur passionné par ArumA 🚀"
          photos={userPhotos} 
          videos={userVideos}
          isOwner={true}
        />

        <section className="md:col-span-7 space-y-4">
          <PostCard 
            user={currentUser} 
            content="Mon premier post sur mon nouveau profil !" 
            time="À l'instant" 
          />
        </section>
      </main>
    </div>
  );
};

export default Profile;