import React from 'react';
import NavBar from '../components/Layout/Navbar';
import PostCard from '../components/Feed/PostCard';
import { usePostsContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import SidebarLeft from '../components/Home/SidebarLeft';
import SidebarRight from '../components/Home/SidebarRight';
import CreatePost from '../components/Home/CreatePost';

const Home = () => {
  const { posts, loading: postsLoading } = usePostsContext();
  const { user, loading: authLoading } = useAuth();

  /**
   * LOGIQUE D'AFFICHAGE DES LOADERS
   * On affiche le loader global uniquement si l'auth est en cours et qu'on n'a pas encore d'user.
   */
  if (authLoading && !user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F0F2F5] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium">Connexion en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 px-4">
        {/* Colonne de Gauche */}
        <SidebarLeft />

        {/* Flux Central (Flux de Posts) */}
        <section className="col-span-1 md:col-span-8 lg:col-span-6 py-4">
          <CreatePost userAvatar={user?.avatar_url} />

          <div className="space-y-4 mt-4">
            {postsLoading && posts.length === 0 ? (
              // Squelette de chargement pendant le premier fetch
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white p-4 rounded-xl shadow-sm animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-20 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard key={post.id} {...post} />
                  ))
                ) : (
                  <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-200">
                    <p className="text-gray-500">Aucune publication à afficher.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Colonne de Droite */}
        <SidebarRight />
      </main>
    </div>
  );
};

export default Home;