import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LivePlayer = ({ streamTitle, streamer, roomName }) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!roomName) return;

    const initializeJitsi = () => {
      if (!jitsiContainerRef.current) return;

      // Nettoyage forcé du conteneur
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      jitsiContainerRef.current.innerHTML = ''; 

      setLoading(false);
      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: user ? `${user.firstname} ${user.lastname}` : 'Spectateur Aruma'
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'fullscreen', 'chat', 'settings', 'raisehand',
            'videoquality', 'tileview',
          ],
        }
      };

      try {
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      } catch (err) {
        console.error("Erreur Jitsi:", err);
      }
    };

    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = initializeJitsi;
      document.body.appendChild(script);
    } else {
      initializeJitsi();
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, user]);

  return (
    <div className="w-full h-full bg-black flex flex-col relative">
      <div className="relative flex-1 flex items-center justify-center bg-gray-900 overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-white z-10">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="text-sm">Connexion...</p>
          </div>
        )}
        <div ref={jitsiContainerRef} className="w-full h-full" />
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <div className="bg-red-600 text-white px-3 py-1 rounded text-[10px] font-bold uppercase animate-pulse">
            En Direct
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePlayer;