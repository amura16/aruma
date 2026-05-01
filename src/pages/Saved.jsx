import React, { useState, useEffect } from 'react';
import { Bookmark, FileText, Image as ImageIcon, Film, ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/Layout/Navbar';
import PostCard from '../components/Feed/PostCard';
import supabase from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Saved = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, status, images, videos

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Récupérer les IDs des posts enregistrés
        const { data: savedData, error: savedError } = await supabase
          .from('saved_posts')
          .select('post_id')
          .eq('user_id', user.id);

        if (savedError) throw savedError;

        if (savedData.length > 0) {
          const postIds = savedData.map(s => s.post_id);

          // Récupérer les détails des posts
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select(`
              *,
              author:profiles!user_id (id, username, firstname, lastname, avatar_url),
              likes (user_id),
              comments (
                *,
                user:profiles!user_id (id, username, firstname, lastname, avatar_url)
              )
            `)
            .in('id', postIds);

          if (postsError) throw postsError;
          setSavedPosts(postsData || []);
        }
      } catch (err) {
        console.error("Erreur fetchSavedPosts:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user]);

  // Filtrage par catégorie
  const filteredPosts = savedPosts.filter(post => {
    const isVideo = post.image_url?.match(/\.(mp4|webm|ogg|mov)$/i);
    const isImage = post.image_url && !isVideo;

    if (activeTab === 'status') return !post.image_url;
    if (activeTab === 'images') return isImage;
    if (activeTab === 'videos') return isVideo;
    return true;
  });

  const counts = {
    all: savedPosts.length,
    status: savedPosts.filter(p => !p.image_url).length,
    images: savedPosts.filter(p => p.image_url && !p.image_url.match(/\.(mp4|webm|ogg|mov)$/i)).length,
    videos: savedPosts.filter(p => p.image_url?.match(/\.(mp4|webm|ogg|mov)$/i)).length
  };

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === id
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
        }`}
    >
      <Icon size={20} />
      <span>{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-12">
      <NavBar />

      <main className="max-w-[700px] mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition lg:hidden">
            <ChevronLeft size={24} />
          </button>
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
            <Bookmark size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Enregistrements</h1>
            <p className="text-gray-500 font-medium">Retrouvez vos publications préférées</p>
          </div>
        </div>

        {/* Navigation Onglets */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <TabButton id="all" label="Tous" icon={Bookmark} count={counts.all} />
          <TabButton id="status" label="Statuts" icon={FileText} count={counts.status} />
          <TabButton id="images" label="Images" icon={ImageIcon} count={counts.images} />
          <TabButton id="videos" label="Vidéos" icon={Film} count={counts.videos} />
        </div>

        {/* Liste des Posts */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={40} className="text-blue-600 animate-spin" />
              <p className="text-gray-500 font-bold">Chargement de vos trésors...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <PostCard
                key={post.id}
                id={post.id}
                user={{
                  id: post.author.id,
                  name: `${post.author.firstname} ${post.author.lastname}`,
                  avatar: post.author.avatar_url
                }}
                content={post.content}
                image={post.image_url}
                time={post.created_at}
                likes_count={post.likes_count}
                isLikedByMe={post.likes?.some(l => l.user_id === user?.id)}
                comments={post.comments}
              />
            ))
          ) : (
            <div className="bg-white p-12 rounded-2xl text-center border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun enregistrement ici</h3>
              <p className="text-gray-500 max-w-[300px] mx-auto">
                Les publications que vous enregistrez apparaîtront dans cette catégorie.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Explorer le fil d'actualité
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Saved;