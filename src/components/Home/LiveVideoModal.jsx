import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import LiveChat from '../Live/LiveChat';

const LiveVideoModal = ({ closeModal }) => {
  const jitsiContainerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { user } = useAuth();
  const [jitsiApi, setJitsiApi] = useState(null);
  const roomName = useRef(`ArumaLive-${user?.id?.substring(0, 8) || Math.random().toString(36).substring(7)}`).current;

  // 1. Charger le script public
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      setTimeout(() => setScriptLoaded(true), 500);
    };
    document.body.appendChild(script);
  }, []);

  // 2. Initialiser Jitsi sur meet.jit.si
  useEffect(() => {
    if (scriptLoaded && jitsiContainerRef.current && !jitsiApi && window.JitsiMeetExternalAPI) {

      const initializeJitsi = async () => {
        try {
          if (user) {
            await supabase.from('active_lives').upsert([{
              user_id: user.id,
              room_name: roomName
            }]);
          }

          const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            userInfo: {
              displayName: user ? `${user.firstname} ${user.lastname}` : 'Diffuseur Aruma'
            },
            configOverwrite: {
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              prejoinPageEnabled: false,
              disableDeepLinking: true,
            },
            interfaceConfigOverwrite: {
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'tileview', 'videobackgroundblur',
              ],
            }
          };

          const api = new window.JitsiMeetExternalAPI('meet.jit.si', options);
          setJitsiApi(api);
          setIsReady(true);

          api.addEventListener('videoConferenceLeft', () => {
            handleEndLive();
          });
        } catch (e) {
          console.error("Erreur Jitsi Studio:", e);
        }
      };

      initializeJitsi();
    }

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [scriptLoaded, user]);

  const handleEndLive = async () => {
    if (user) {
      await supabase.from('active_lives').delete().eq('user_id', user.id);
    }
    if (jitsiApi) {
      jitsiApi.dispose();
      setJitsiApi(null);
    }
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col" style={{ height: '100dvh' }}>
      {/* Header - Hauteur fixe 60px */}
      <div className="h-[60px] flex items-center justify-between px-4 bg-[#1c1e21] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
          <h2 className="text-white font-bold text-base">ArumA Studio</h2>
        </div>
        <button 
          onClick={handleEndLive} 
          className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition flex items-center gap-2"
        >
          <X size={18} /> Arrêter
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black">
        <div className="h-[60%] lg:h-full lg:flex-1 relative overflow-hidden bg-black flex flex-col">
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-50 bg-black">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-xs">Initialisation du studio...</p>
            </div>
          )}
          <div 
            ref={jitsiContainerRef} 
            className="w-full h-full relative"
            style={{ position: 'relative', height: '100%', width: '100%' }}
          />
        </div>

        <div className="h-[40%] lg:h-full lg:w-[350px] bg-white border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col overflow-hidden">
          <LiveChat roomName={roomName} />
        </div>
      </div>
    </div>
  );
};

export default LiveVideoModal;
