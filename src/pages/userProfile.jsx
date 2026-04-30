import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import { usePosts } from '../hooks/usePosts';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import PostCard from '../components/Feed/PostCard';
import NavBar from '../components/Layout/Navbar'; // Si besoin

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts } = usePosts();
  
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
        navigate('/404'); // Ou gérer l'erreur autrement
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

  // Filtrer les posts pour n'afficher que ceux de cet utilisateur
  const userPosts = posts.filter(post => post.author?.id === id || post.user_id === id);

  // Mettre en forme les données pour ProfileHeader et ProfileSidebar
  const displayUser = {
    firstname: profileUser.firstname,
    lastname: profileUser.lastname,
    avatar_url: profileUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profileUser.firstname}`,
    cover_url: profileUser.cover_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    bio: profileUser.bio || "Cet utilisateur n'a pas encore de bio."
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* On peut ajouter la NavBar ici si tu veux qu'elle apparaisse sur les profils */}
      
      <ProfileHeader user={displayUser} isOwner={false} />

      <main className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 px-4 pb-10">
        
        <ProfileSidebar 
          bio={displayUser.bio}
          photos={[]} // À connecter à la table files si besoin plus tard
          videos={[]}
          isOwner={false}
        />

        <section className="md:col-span-7 space-y-4">
          {userPosts.length === 0 ? (
            <div className="bg-white p-6 rounded-xl text-center text-gray-500 border border-gray-200">
              Cet utilisateur n'a pas encore publié de post.
            </div>
          ) : (
            userPosts.map(post => (
              <PostCard 
                key={post.id}
                id={post.id}
                user={{
                  id: profileUser.id,
                  name: `${profileUser.firstname} ${profileUser.lastname}`,
                  avatar: profileUser.avatar_url
                }}
                content={post.content}
                image={post.image_url}
                time={post.created_at}
                likes_count={post.likes_count}
                isLikedByMe={post.isLikedByMe}
                comments={post.comments}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default UserProfile;