import React from 'react';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import PostCard from '../components/Feed/PostCard';
import { useAuth } from '../context/AuthContext';
import { usePostsContext } from '../context/PostContext'; // Utilisation directe du context pour plus de stabilité

const Profile = () => {
  const { user: currentUser } = useAuth();
  const { posts, loading } = usePostsContext();

  // Filtrer pour n'afficher que les publications dont l'utilisateur est l'auteur
  // Cela inclut les posts originaux et les partages effectués par l'utilisateur
  const userPosts = posts.filter(post => post.author?.id === currentUser?.id);

  // --- LOGIQUE DES MÉDIAS POUR LA SIDEBAR ---
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
  
  // Extraire les photos des publications de l'utilisateur
  const userPhotos = userPosts
    .filter(post => post.image_url && !videoExtensions.some(ext => post.image_url.toLowerCase().endsWith(ext)))
    .map(post => ({ url: post.image_url }));

  // Extraire les vidéos des publications de l'utilisateur
  const userVideos = userPosts
    .filter(post => post.image_url && videoExtensions.some(ext => post.image_url.toLowerCase().endsWith(ext)))
    .map(post => ({ url: post.image_url }));

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* En-tête du profil avec les informations de l'utilisateur */}
      <ProfileHeader user={currentUser} isOwner={true} />

      <main className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 px-4">
        
        {/* Sidebar : Infos, Photos et Vidéos */}
        <div className="md:col-span-12 lg:col-span-5">
          <ProfileSidebar
            user={currentUser}
            photos={userPhotos}
            videos={userVideos}
            isOwner={true}
          />
        </div>

        {/* Flux de publications (Posts + Partages) */}
        <section className="md:col-span-12 lg:col-span-7 space-y-4 pb-8">
          {loading ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500">Chargement de vos publications...</p>
            </div>
          ) : (
            userPosts.map(post => (
              <PostCard
                key={post.id}
                id={post.id}
                author={post.author} // L'auteur est l'utilisateur actuel
                content={post.content}
                image_url={post.image_url}
                created_at={post.created_at}
                likes_count={post.likes_count}
                isLikedByMe={post.isLikedByMe}
                comments={post.comments}
                total_comments_count={post.total_comments_count}
                parent_post={post.parent_post} // AJOUT CRUCIAL : Supporte l'affichage du post partagé
              />
            ))
          )}

          {/* État vide si aucune publication n'est trouvée */}
          {!loading && userPosts.length === 0 && (
            <div className="bg-white p-12 rounded-xl text-center border border-gray-200 shadow-sm">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Aucune publication</h3>
              <p className="text-gray-500 mt-1">Vos publications et partages apparaîtront ici.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Profile;