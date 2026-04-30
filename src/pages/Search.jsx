import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/Layout/Navbar';
import PostCard from '../components/Feed/PostCard';
import MediaGrid from '../components/Profile/MediaGrid';
import { usePosts } from '../hooks/usePosts';
import { supabase } from '../services/supabaseClient';
import { Users, FileText, Image as ImageIcon, Film, Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personnes');
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Utiliser les posts du contexte global pour conserver la réactivité (likes, commentaires)
  const { posts } = usePosts();

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!query.trim()) {
        setProfiles([]);
        return;
      }
      
      setLoadingProfiles(true);
      try {
        const searchTerm = `%${query}%`;
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`firstname.ilike.${searchTerm},lastname.ilike.${searchTerm},username.ilike.${searchTerm}`);

        if (error) throw error;
        setProfiles(data || []);
      } catch (err) {
        console.error("Erreur recherche profils:", err.message);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, [query]);

  // Filtrer les posts localement pour plus de simplicité et réutiliser le contexte
  const qLower = query.toLowerCase();
  
  // 1. Statuts : Tous les posts qui contiennent le texte recherché
  const statusResults = posts.filter(post => post.content?.toLowerCase().includes(qLower));

  // 2. Extensions pour photos et vidéos
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
  
  // 3. Photos : Les posts qui ont une image/photo ET correspondent à la recherche (ou via l'auteur)
  const photoResults = statusResults
    .filter(post => post.image_url && !videoExtensions.some(ext => post.image_url.toLowerCase().endsWith(ext)))
    .map(post => ({ url: post.image_url, post_id: post.id }));

  // 4. Vidéos : Les posts qui ont une vidéo ET correspondent à la recherche
  const videoResults = statusResults
    .filter(post => post.image_url && videoExtensions.some(ext => post.image_url.toLowerCase().endsWith(ext)))
    .map(post => ({ url: post.image_url, post_id: post.id }));


  const tabs = [
    { id: 'personnes', label: 'Personnes', icon: <Users size={18} />, count: profiles.length },
    { id: 'statuts', label: 'Statuts', icon: <FileText size={18} />, count: statusResults.length },
    { id: 'photos', label: 'Photos', icon: <ImageIcon size={18} />, count: photoResults.length },
    { id: 'videos', label: 'Vidéos', icon: <Film size={18} />, count: videoResults.length },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />
      
      <main className="max-w-[1000px] mx-auto pt-6 px-4 pb-20">
        
        {/* Entête de recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <SearchIcon size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Résultats de recherche pour <span className="text-blue-600">"{query}"</span>
            </h1>
          </div>
        </div>

        {/* Navigation des Onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 flex overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-bold text-[15px] border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              {tab.icon}
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[12px] ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Contenu des Onglets */}
        <div className="space-y-4">
          
          {/* ONGLET : PERSONNES */}
          {activeTab === 'personnes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingProfiles ? (
                <div className="col-span-full py-10 text-center text-gray-500">Recherche des profils...</div>
              ) : profiles.length > 0 ? (
                profiles.map((profile) => (
                  <div key={profile.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      <img 
                        src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.firstname}`} 
                        alt={profile.firstname} 
                        className="w-14 h-14 rounded-full object-cover border border-gray-100"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900 text-[16px]">{profile.firstname} {profile.lastname}</h3>
                        <p className="text-gray-500 text-[13px]">@{profile.username || profile.firstname.toLowerCase()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/user/${profile.id}`)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-4 py-2 rounded-lg text-sm transition"
                    >
                      Voir profil
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white p-10 rounded-xl border border-gray-200 text-center text-gray-500">
                  Aucune personne trouvée pour "{query}".
                </div>
              )}
            </div>
          )}

          {/* ONGLET : STATUTS */}
          {activeTab === 'statuts' && (
            <div className="max-w-[650px] mx-auto space-y-4">
              {statusResults.length > 0 ? (
                statusResults.map(post => (
                  <PostCard 
                    key={post.id}
                    id={post.id}
                    user={post.author ? {
                      id: post.author.id,
                      name: `${post.author.firstname} ${post.author.lastname}`,
                      avatar: post.author.avatar_url
                    } : null}
                    content={post.content}
                    image={post.image_url}
                    time={post.created_at}
                    likes_count={post.likes_count}
                    isLikedByMe={post.isLikedByMe}
                    comments={post.comments}
                  />
                ))
              ) : (
                <div className="bg-white p-10 rounded-xl border border-gray-200 text-center text-gray-500">
                  Aucun statut trouvé contenant "{query}".
                </div>
              )}
            </div>
          )}

          {/* ONGLET : PHOTOS */}
          {activeTab === 'photos' && (
            <div>
              {photoResults.length > 0 ? (
                <MediaGrid title="" items={photoResults} type="image" />
              ) : (
                <div className="bg-white p-10 rounded-xl border border-gray-200 text-center text-gray-500 max-w-[650px] mx-auto">
                  Aucune photo correspondante trouvée.
                </div>
              )}
            </div>
          )}

          {/* ONGLET : VIDÉOS */}
          {activeTab === 'videos' && (
            <div>
              {videoResults.length > 0 ? (
                <MediaGrid title="" items={videoResults} type="video" />
              ) : (
                <div className="bg-white p-10 rounded-xl border border-gray-200 text-center text-gray-500 max-w-[650px] mx-auto">
                  Aucune vidéo correspondante trouvée.
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Search;
