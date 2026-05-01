import React, { useEffect, useState } from 'react';
import NavBar from '../components/Layout/Navbar';
import VideoSidebar from '../components/Video/VideoSidebar';
import VideoCard from '../components/Video/VideoCard';
import LivePlayer from '../components/Live/LivePlayer';
import supabase from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const VideoFeed = () => {
  const [activeLives, setActiveLives] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("all");
  const navigate = useNavigate();

  // Données pour les vidéos classiques (Reels/Suggérées)
  const staticVideos = [
    {
      id: 'static-1',
      author: { name: "ArumA Tech", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech" },
      title: "Découvrez le futur du développement avec ArumA 🚀",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      time: "Il y a 2 heures",
      views: "12k"
    }
  ];

  // Fonction pour récupérer les lives actifs depuis Supabase
  const fetchLives = async () => {
    const { data, error } = await supabase
      .from('active_lives')
      .select(`
        *,
        user:profiles!user_id (id, firstname, lastname, avatar_url)
      `);

    if (!error && data) {
      setActiveLives(data);
    }
  };

  useEffect(() => {
    fetchLives();

    // Abonnement Realtime pour mettre à jour le flux instantanément
    const channel = supabase
      .channel('video_feed_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'active_lives' },
        () => {
          fetchLives();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />

      <div className="flex h-[calc(100vh-112px)] overflow-hidden">
        {/* Sidebar avec gestion du filtre */}
        <VideoSidebar onFilterChange={setCurrentFilter} />

        <main className="flex-1 overflow-y-auto pt-4 px-4 custom-scrollbar">
          <div className="max-w-[700px] mx-auto pb-20">

            {/* SECTION LIVES (Visible si 'all' ou 'live') */}
            {(currentFilter === "all" || currentFilter === "live") && activeLives.length > 0 && (
              <div className="mb-8 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                  Vidéos en direct
                </h2>

                {activeLives.map((live) => (
                  <div key={live.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Intégration du Player Jitsi en temps réel */}
                    <div className="aspect-video w-full bg-black relative">
                      <LivePlayer
                        roomName={live.room_name}
                        streamer={live.user}
                      />
                      <button
                        onClick={() => navigate(`/live?room=${live.room_name}`)}
                        className="absolute bottom-4 right-4 z-30 bg-blue-600/90 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition backdrop-blur-sm"
                      >
                        Rejoindre le chat
                      </button>
                    </div>

                    <div className="p-4 flex items-center gap-3">
                      <img
                        src={live.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${live.user_id}`}
                        className="w-12 h-12 rounded-full border-2 border-red-500 p-0.5"
                        alt="avatar"
                      />
                      <div>
                        <h3 className="font-bold text-lg">Direct de {live.user?.firstname} {live.user?.lastname}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                          Live sur ArumA
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION REELS / STATIQUES (Visible si 'all' ou 'reels') */}
            {(currentFilter === "all" || currentFilter === "reels") && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">
                  {currentFilter === "reels" ? "Reels" : "Vidéos suggérées"}
                </h2>
                {staticVideos.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            )}

            {/* Message si aucun live n'est en cours lors du filtrage */}
            {currentFilter === "live" && activeLives.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-500 italic">Aucun direct pour le moment.</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default VideoFeed;