import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const LiveVideoModal = ({ closeModal }) => {
  const jitsiContainerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { user } = useAuth();
  const [jitsiApi, setJitsiApi] = useState(null);
  const roomName = `ArumaLive-${user?.id?.substring(0, 8) || Math.random().toString(36).substring(7)}`;

  // 1. Charger le script
  useEffect(() => {
    const scriptId = 'jitsi-external-api';
    if (window.JitsiMeetExternalAPI) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      setTimeout(() => setScriptLoaded(true), 500);
    };
    document.body.appendChild(script);
  }, []);

  // 2. Initialiser Jitsi
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
              displayName: user ? `${user.firstname} ${user.lastname}` : 'Utilisateur Aruma'
            },
            configOverwrite: {
              startWithAudioMuted: false,
              disableDeepLinking: true,
              prejoinPageEnabled: false,
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
          
          // On affiche l'interface dès que l'API est initialisée
          setIsReady(true);

          api.addEventListener('videoConferenceLeft', () => {
            handleEndLive();
          });
        } catch (e) {
          console.error("Erreur Jitsi:", e);
        }
      };

      initializeJitsi();
    }
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 bg-[#1c1e21] border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <h2 className="text-white font-bold text-lg">ArumA Live Studio</h2>
        </div>
        <button onClick={handleEndLive} className="p-2 hover:bg-white/10 rounded-full text-white transition">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-50 bg-black">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="text-lg font-medium">Connexion au réseau ArumA...</p>
          </div>
        )}
        <div 
          ref={jitsiContainerRef} 
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
      </div>

      <div className="p-3 bg-[#1c1e21] text-center border-t border-white/5">
        <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
          Flux chiffré • ArumA Realtime Studio
        </p>
      </div>
    </div>
  );
};

export default LiveVideoModal;