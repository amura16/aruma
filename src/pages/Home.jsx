import React from 'react';
import NavBar from '../components/Layout/Navbar';
import PostCard from '../components/Feed/PostCard';
import useFetchPosts from '../hooks/useFetchPosts';

// Nouveaux imports propres
import SidebarLeft from '../components/Home/SidebarLeft';
import SidebarRight from '../components/Home/SidebarRight';
import CreatePost from '../components/Home/CreatePost';

const Home = () => {
  const { posts, loading, error } = useFetchPosts();
  const myAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

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
                user={post.author ? { 
                  name: `${post.author.firstname} ${post.author.lastname}`, 
                  avatar: post.author.avatar_url 
                } : null} 
                content={post.content} 
                image={post.image_url} 
                time={post.created_at} 
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