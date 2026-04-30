import React, { useEffect, useState } from 'react';
import NavBar from '../components/Layout/Navbar';
import VideoSidebar from '../components/Video/VideoSidebar';
import VideoCard from '../components/Video/VideoCard';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const VideoFeed = () => {
  const [activeLives, setActiveLives] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchLives();

    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel('active_lives_changes')
      .on('postgres_changes', { event: '*', table: 'active_lives' }, fetchLives)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const videoData = [
    {
      id: 1,
      author: { name: "ArumA Tech", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech" },
      title: "Découvrez le futur du développement avec ArumA 🚀",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      time: "Il y a 2 heures",
      views: "12k"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />

      <div className="flex h-[calc(100vh-112px)] overflow-hidden">
        <VideoSidebar />

        <main className="flex-1 overflow-y-auto pt-4 px-4 custom-scrollbar">
          <div className="max-w-[700px] mx-auto">

            {/* SECTION LIVES ACTIFS */}
            {activeLives.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                  Vidéos en direct
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeLives.map((live) => (
                    <div
                      key={live.id}
                      onClick={() => navigate(`/live?room=${live.room_name}`)}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition border border-gray-200"
                    >
                      <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded mb-2 animate-pulse">EN DIRECT</div>
                          <p className="text-sm font-medium">Rejoindre le live de {live.user?.firstname}</p>
                        </div>
                      </div>
                      <div className="p-3 flex gap-3 items-center">
                        <img src={live.user?.avatar_url} className="w-10 h-10 rounded-full" alt="avatar" />
                        <div>
                          <h4 className="font-bold text-sm">Direct de {live.user?.firstname} {live.user?.lastname}</h4>
                          <p className="text-xs text-gray-500">En cours sur ArumA Live</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold mb-4">Vidéos suggérées</h2>
            {videoData.map((video) => (
              <VideoCard
                key={video.id}
                author={video.author}
                title={video.title}
                videoUrl={video.videoUrl}
                time={video.time}
                views={video.views}
              />
            ))}

            <div className="py-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VideoFeed;