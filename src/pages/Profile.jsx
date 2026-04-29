import React from 'react';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import PostCard from '../components/Feed/PostCard';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';

const Profile = () => {
  const { user: currentUser } = useAuth();
  const { posts } = usePosts();

  // Filter posts to show only user's posts
  const userPosts = posts.filter(post => post.author?.id === currentUser.id);

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
          {userPosts.map(post => (
            <PostCard 
              key={post.id}
              id={post.id}
              user={post.author} 
              content={post.content} 
              image={post.image_url}
              time={post.created_at}
              likes_count={post.likes_count}
              isLikedByMe={post.isLikedByMe}
              comments={post.comments}
            />
          ))}
          {userPosts.length === 0 && (
            <div className="bg-white p-8 rounded-xl text-center text-gray-500 border border-gray-200">
              Vous n'avez pas encore de publications.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Profile;