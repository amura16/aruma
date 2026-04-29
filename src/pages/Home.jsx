import React from 'react';
import NavBar from '../components/Layout/Navbar';
import PostCard from '../components/Feed/PostCard';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../context/AuthContext';

// Nouveaux imports propres
import SidebarLeft from '../components/Home/SidebarLeft';
import SidebarRight from '../components/Home/SidebarRight';
import CreatePost from '../components/Home/CreatePost';

const Home = () => {
  const { posts, loading, error } = usePosts();
  const { user, loading: authLoading } = useAuth();
  const myAvatar = user?.avatar_url;

  if (authLoading) {
    return <div className="h-screen flex items-center justify-center">Chargement du profil...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />
      
      <main className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 px-4">
        
        <SidebarLeft />

        {/* --- FLUX CENTRAL --- */}
        <section className="col-span-1 md:col-span-8 lg:col-span-6 py-4">
          <CreatePost userAvatar={myAvatar} />

          {loading && <div className="text-center py-10">Chargement des posts...</div>}
          
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                id={post.id}
                user={post.author ? { 
                  name: `${post.author.firstname} ${post.author.lastname}`, 
                  avatar: post.author.avatar_url 
                } : null} 
                content={post.content} 
                image={post.image_url} 
                time={post.created_at} 
                likes_count={post.likes_count}
                isLikedByMe={post.isLikedByMe}
                comments={post.comments}
              />
            ))}
          </div>
        </section>

        <SidebarRight />

      </main>
    </div>
  );
};

export default Home;