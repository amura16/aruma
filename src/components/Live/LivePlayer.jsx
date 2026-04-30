import React, { useEffect, useRef, useState } from 'react';
import { Users, Eye, Share2, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LivePlayer = ({ streamTitle, streamer, roomName }) => {
  const jitsiContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!roomName) return;

    const script = document.createElement('script');
    script.src = 'https://8x8.vc/vpaas-magic-cookie-3d5f5739343340e4878f0d57f49557b5/external_api.js';
    script.async = true;

    script.onload = () => {
      setLoading(false);
      const domain = '8x8.vc';
      const options = {
        roomName: `vpaas-magic-cookie-3d5f5739343340e4878f0d57f49557b5/${roomName}`,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: user ? `${user.firstname} ${user.lastname}` : 'Spectateur Aruma'
        },
        configOverwrite: {
          startWithAudioMuted: true, // Les spectateurs commencent muets
          disableDeepLinking: true,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'fullscreen', 'chat', 'settings', 'raisehand',
            'videoquality', 'tileview',
          ],
        }
      };

      new window.JitsiMeetExternalAPI(domain, options);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [roomName, user]);

  return (
    <div className="flex-1 bg-black flex flex-col relative min-h-[500px]">
      {/* Player Vidéo Jitsi */}
      <div className="relative flex-1 flex items-center justify-center bg-gray-900 overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-white z-10">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p>Connexion au direct...</p>
          </div>
        )}
        <div ref={jitsiContainerRef} className="w-full h-full" />

        {/* Badge EN DIRECT flottant */}
        <div className="absolute top-4 left-4 flex gap-2 z-20 pointer-events-none">
          <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase animate-pulse">
            En Direct
          </div>
        </div>
      </div>

      {/* Barre d'infos Streamer */}
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={streamer.avatar} className="w-12 h-12 rounded-full border-2 border-red-500 p-0.5" alt="" />
            <div>
              <h1 className="font-bold text-lg leading-tight">{streamTitle}</h1>
              <p className="text-sm text-gray-600 font-medium">{streamer.name}</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-bold transition">
              <Share2 size={20} /> Partager
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold transition">
              <Heart size={20} /> Soutenir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePlayer;