import React from 'react';
import NavBar from '../components/Layout/Navbar';
import LivePlayer from '../components/Live/LivePlayer';
import LiveChat from '../components/Live/LiveChat';
import { useLocation, Navigate } from 'react-router-dom';

const LiveStream = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const roomName = searchParams.get('room');

  if (!roomName) {
    return <Navigate to="/video" replace />;
  }

  const currentStream = {
    title: `Direct de ArumA`,
    roomName: roomName,
    streamer: {
      name: "Diffuseur en direct",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Live"
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <NavBar />

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Partie Gauche : Vidéo et Suggestions */}
        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <LivePlayer
            streamTitle={currentStream.title}
            streamer={currentStream.streamer}
            roomName={currentStream.roomName}
          />

          {/* Autres Lives suggérés (Statiques pour le moment) */}
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Vidéos en direct suggérées</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="aspect-video bg-gray-200 relative">
                    <img src={`https://picsum.photos/400/225?random=${i}`} className="w-full h-full object-cover" alt="" />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">EN DIRECT</div>
                  </div>
                  <div className="p-3 flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm line-clamp-2">Live spécial ArumA #00{i}</h4>
                      <p className="text-xs text-gray-500 mt-1">Utilisateur ArumA</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <LiveChat />
      </div>
    </div>
  );
};

export default LiveStream;