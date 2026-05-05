import React, { useEffect, useState } from 'react';
import NavBar from '../components/Layout/Navbar';
import LivePlayer from '../components/Live/LivePlayer';
import LiveChat from '../components/Live/LiveChat';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import { Loader2, Share2, Heart } from 'lucide-react';

const LiveStream = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const roomName = searchParams.get('room');

  const [streamerInfo, setStreamerInfo] = useState(null);
  const [otherLives, setOtherLives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomName) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Récupérer les infos du streamer actuel
        const { data: currentLive, error: liveError } = await supabase
          .from('active_lives')
          .select(`
            *,
            user:profiles!user_id (id, firstname, lastname, avatar_url)
          `)
          .eq('room_name', roomName)
          .single();

        if (currentLive) {
          setStreamerInfo({
            title: `Direct de ${currentLive.user.firstname}`,
            roomName: roomName,
            streamer: {
              name: `${currentLive.user.firstname} ${currentLive.user.lastname}`,
              avatar: currentLive.user.avatar_url
            },
            peerId: currentLive.peer_id
          });
        }

        // 2. Récupérer les autres lives suggérés
        const { data: others, error: othersError } = await supabase
          .from('active_lives')
          .select(`
            *,
            user:profiles!user_id (id, firstname, lastname, avatar_url)
          `)
          .neq('room_name', roomName);

        if (others) {
          setOtherLives(others);
        }

      } catch (err) {
        console.error("Erreur LiveStream:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomName]);

  if (!roomName) {
    return <Navigate to="/video" replace />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden" style={{ height: '100dvh' }}>
      <NavBar />

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Partie Gauche : Vidéo et Suggestions */}
        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-white">
          {/* Zone Vidéo - Hauteur fixée à 450px sur mobile pour laisser le lecteur respirer */}
          <div className="h-[450px] lg:h-auto lg:flex-1 bg-black shrink-0 relative">
            {streamerInfo ? (
              <LivePlayer
                streamTitle={streamerInfo.title}
                streamer={streamerInfo.streamer}
                peerId={streamerInfo.peerId}
              />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center text-white p-10 text-center">
                <div>
                  <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
                  <p className="text-xl font-medium">{loading ? "Connexion..." : "Indisponible"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Barre d'infos Streamer */}
          {streamerInfo && (
            <div className="p-4 border-b border-gray-100 bg-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <img src={streamerInfo.streamer.avatar} className="w-12 h-12 rounded-full border-2 border-red-500 p-0.5" alt="" />
                  <div>
                    <h1 className="font-bold text-lg leading-tight">{streamerInfo.title}</h1>
                    <p className="text-sm text-gray-600 font-medium">{streamerInfo.streamer.name}</p>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 px-4 py-2 rounded-lg font-bold text-sm">
                    <Share2 size={18} /> Partager
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Autres Lives suggérés */}
          {otherLives.length > 0 && (
            <div className="p-6 bg-gray-50">
              <h2 className="text-xl font-bold mb-4 text-sm">Lives suggérés</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherLives.map((live) => (
                  <div key={live.id} onClick={() => navigate(`/live?room=${live.room_name}`)} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="aspect-video bg-gray-900" />
                    <div className="p-2 text-xs font-bold">Live de {live.user?.firstname}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Chat - Flexible sur mobile (prend le reste), fixe sur desktop */}
        <div className="w-full lg:w-[400px] flex-1 lg:flex-none border-t lg:border-t-0 lg:border-l border-gray-200 bg-white min-h-[200px]">
          <LiveChat roomName={roomName} />
        </div>
      </div>
    </div>
  );
};

export default LiveStream;
