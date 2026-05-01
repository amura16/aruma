import React, { useState, useEffect } from 'react';
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

  // État local pour stocker les posts dans un ordre fixe après le mélange
  const [shuffledPosts, setShuffledPosts] = useState([]);

  /**
   * STABILISATION DU MÉLANGE
   * Ce useEffect s'assure que le mélange ne se produit qu'une seule fois
   * au moment où les posts sont chargés initialement.
   */
  useEffect(() => {
    if (!loading && posts && posts.length > 0) {
      // Si c'est le premier chargement (shuffledPosts est vide)
      if (shuffledPosts.length === 0) {
        const randomOrder = [...posts].sort(() => Math.random() - 0.5);
        setShuffledPosts(randomOrder);
      } else {
        /**
         * SYNCHRONISATION INTELLIGENTE
         * Si les posts changent dans le contexte (Like, nouveau post), 
         * on met à jour les données des posts existants sans changer leur place.
         */
        const updatedShuffled = shuffledPosts.map(sp => {
          const freshData = posts.find(p => p.id === sp.id);
          return freshData ? freshData : sp;
        });

        // Gérer l'ajout de nouveaux posts (ex: via CreatePost) sans tout remélanger
        const newPosts = posts.filter(p => !shuffledPosts.find(sp => sp.id === p.id));

        if (newPosts.length > 0) {
          setShuffledPosts([...newPosts, ...updatedShuffled]);
        } else {
          setShuffledPosts(updatedShuffled);
        }
      }
    }
  }, [posts, loading]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 px-4">
        {/* Sidebar Gauche */}
        <SidebarLeft />

        {/* Flux Central */}
        <section className="col-span-1 md:col-span-8 lg:col-span-6 py-4">
          <CreatePost userAvatar={user?.avatar_url} />

          {/* Affichage des posts */}
          <div className="space-y-4 mt-4">
            {loading && shuffledPosts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
                  <p>Chargement de votre fil d'actualité...</p>
                </div>
              </div>
            ) : (
              shuffledPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))
            )}

            {!loading && shuffledPosts.length === 0 && (
              <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
                Aucun message à afficher pour le moment.
              </div>
            )}
          </div>
        </section>

        {/* Sidebar Droite */}
        <SidebarRight />
      </main>
    </div>
  );
};

export default Home;