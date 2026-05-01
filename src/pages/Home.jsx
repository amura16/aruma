import React from 'react';
import NavBar from '../components/Layout/Navbar';
import PostCard from '../components/Feed/PostCard';
import { usePostsContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import SidebarLeft from '../components/Home/SidebarLeft';
import SidebarRight from '../components/Home/SidebarRight';
import CreatePost from '../components/Home/CreatePost';

const Home = () => {
  const { posts, loading } = usePostsContext();
  const { user, loading: authLoading } = useAuth();

  // On extrait l'avatar de l'utilisateur connecté
  const myAvatar = user?.avatar_url;

  if (authLoading) {
    return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />
      <main className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 px-4">
        <SidebarLeft />

        <section className="col-span-1 md:col-span-8 lg:col-span-6 py-4">
          {/* On passe l'avatar au composant CreatePost */}
          <CreatePost userAvatar={myAvatar} />

          {loading && <div className="text-center py-10">Chargement des posts...</div>}

          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </section>

        <SidebarRight />
      </main>
    </div>
  );
};

export default Home;