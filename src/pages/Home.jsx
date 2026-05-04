import React from 'react';
import NavBar from '../components/Layout/Navbar';
import PostCard from '../components/Feed/PostCard';
import { usePostsContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import SidebarLeft from '../components/Home/SidebarLeft';
import SidebarRight from '../components/Home/SidebarRight';
import CreatePost from '../components/Home/CreatePost';

const Home = () => {
  // On récupère les posts et l'état de chargement depuis le context
  // Grâce au Realtime dans PostContext, cette liste se mettra à jour 
  // automatiquement lors d'un partage (insertion d'un post avec parent_id)
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
        {/* Colonne de Gauche : Profil, Raccourcis */}
        <SidebarLeft />

        {/* Flux Central (Flux de Posts) */}
        <section className="col-span-1 md:col-span-8 lg:col-span-6 py-4">
          {/* Zone de création de post */}
          <CreatePost userAvatar={user?.avatar_url} />

          <div className="space-y-4 mt-4">
            {postsLoading && posts.length === 0 ? (
              // Squelette de chargement (Skeleton UI) pendant le premier fetch
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
                  /* 
                    On boucle sur les posts. 
                    Si c'est un partage, c'est un post "normal" avec un parent_id,
                    il sera donc rendu ici par PostCard.
                  */
                  posts.map((post) => (
                    <PostCard key={post.id} {...post} />
                  ))
                ) : (
                  /* État vide */
                  <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-200">
                    <div className="flex flex-col items-center gap-2">
                       <p className="text-gray-500 font-medium">Aucune publication à afficher.</p>
                       <p className="text-sm text-gray-400">Soyez le premier à partager quelque chose !</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Colonne de Droite : Contacts, Suggestions */}
        <SidebarRight />
      </main>
    </div>
  );
};

export default Home;