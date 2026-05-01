import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import { usePostsContext } from '../context/PostContext'; // Utilisation du context harmonisé
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import PostCard from '../components/Feed/PostCard';
import NavBar from '../components/Layout/Navbar';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts } = usePostsContext(); // Utilisation de usePostsContext

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
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
    return <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">Chargement du profil...</div>;
  }

  if (!profileUser) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">Utilisateur introuvable</div>;
  }

  // Filtrer les posts de cet utilisateur
  const userPosts = posts.filter(post => post.author?.id === id || post.user_id === id);

  const displayUser = {
    firstname: profileUser.firstname,
    lastname: profileUser.lastname,
    avatar_url: profileUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profileUser.firstname}`,
    cover_url: profileUser.cover_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    bio: profileUser.bio
  };

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

      <ProfileHeader user={displayUser} isOwner={false} />

      <main className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 px-4 pb-10">

        <div className="md:col-span-12 lg:col-span-5">
          <ProfileSidebar
            user={displayUser}
            photos={userPhotos}
            videos={userVideos}
            isOwner={false}
          />
        </div>

        <section className="md:col-span-12 lg:col-span-7 space-y-4">
          {userPosts.length === 0 ? (
            <div className="bg-white p-6 rounded-xl text-center text-gray-500 border border-gray-200">
              Cet utilisateur n'a pas encore publié de post.
            </div>
          ) : (
            userPosts.map(post => (
              <PostCard
                key={post.id}
                {...post} // TECHNIQUE CRUCIALE : On passe tout l'objet post
              // Cela garantit que image_url et author sont transmis avec les bons noms
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default UserProfile;