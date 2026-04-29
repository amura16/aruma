import React from 'react';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import PostCard from '../components/Feed/PostCard';

const UserProfile = () => {
  // 1. Simuler les données récupérées depuis une API pour un autre utilisateur
  const otherUser = {
    firstname: "Sonia",
    lastname: "Rakoto",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia",
    cover_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    bio: "Exploratrice urbaine et passionnée de design. ✨"
  };

  // Définir les médias de cet utilisateur
  const userPhotos = [
    { url: "https://picsum.photos/400/400?random=10" },
    { url: "https://picsum.photos/400/400?random=11" },
    { url: "https://picsum.photos/400/400?random=12" },
  ];

  const userVideos = []; // Exemple d'utilisateur sans vidéos

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* isOwner={false} : Affiche "Ajouter" et "Message" au lieu de "Modifier" */}
      <ProfileHeader user={otherUser} isOwner={false} />

      <main className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 px-4">
        
        {/* La sidebar n'affichera pas le bouton "Ajouter une bio" */}
        <ProfileSidebar 
          bio={otherUser.bio}
          photos={userPhotos} 
          videos={userVideos}
          isOwner={false}
        />

        <section className="md:col-span-7 space-y-4">
          {/* Flux de publications de l'autre utilisateur */}
          <PostCard 
            user={otherUser} 
            content="Superbe journée au parc aujourd'hui !" 
            time="Il y a 2 heures" 
          />
        </section>
      </main>
    </div>
  );
};

export default UserProfile;