import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import { usePostsContext } from '../context/PostContext';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import PostCard from '../components/Feed/PostCard';
import NavBar from '../components/Layout/Navbar';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts } = usePostsContext();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // On récupère toutes les colonnes, ce qui inclut l'ID nécessaire aux relations
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProfileUser(data);
      } catch (err) {
        console.error("Erreur lors de la récupération du profil :", err.message);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserProfile();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">Utilisateur introuvable</div>;
  }

  // Filtrer les posts de cet utilisateur
  const userPosts = posts.filter(post => post.author?.id === id || post.user_id === id);

  // CRUCIAL : On construit l'objet en incluant l'ID pour que le bouton "Ajouter/Répondre" fonctionne
  const displayUser = {
    id: profileUser.id, // Identifiant indispensable pour sendRequest dans ProfileHeader
    firstname: profileUser.firstname,
    lastname: profileUser.lastname,
    avatar_url: profileUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profileUser.firstname}`,
    cover_url: profileUser.cover_url || "https://images.unsplash.com/photo-1557683316-973673baf926",
    bio: profileUser.bio
  };

  // Gestion des médias pour la Sidebar
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
  const userPhotos = userPosts
    .filter(post => post.image_url && !videoExtensions.some(ext => post.image_url.toLowerCase().endsWith(ext)))
    .map(post => ({ url: post.image_url }));

  const userVideos = userPosts
    .filter(post => post.image_url && videoExtensions.some(ext => post.image_url.toLowerCase().endsWith(ext)))
    .map(post => ({ url: post.image_url }));

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />

      {/* Le ProfileHeader reçoit maintenant un utilisateur avec un ID valide */}
      <ProfileHeader user={displayUser} isOwner={false} />

      <main className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 px-4 pb-10">

        {/* Colonne Gauche : Infos et Médias */}
        <div className="lg:col-span-5 space-y-4">
          <ProfileSidebar
            user={displayUser}
            photos={userPhotos}
            videos={userVideos}
            isOwner={false}
          />
        </div>

        {/* Colonne Droite : Flux de publications */}
        <section className="lg:col-span-7 space-y-4">
          {userPosts.length === 0 ? (
            <div className="bg-white p-10 rounded-xl text-center text-gray-500 border border-gray-200 shadow-sm">
              <p className="text-lg font-medium">Aucune publication</p>
              <p className="text-sm">Cet utilisateur n'a pas encore partagé de contenu.</p>
            </div>
          ) : (
            userPosts.map(post => (
              <PostCard
                key={post.id}
                {...post}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default UserProfile;