import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Peer } from 'peerjs';
import { useAuth } from '../../context/AuthContext';

const LivePlayer = ({ streamTitle, streamer, peerId }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const { user } = useAuth();
  const peerInstanceRef = useRef(null);
  const currentCallRef = useRef(null);

  useEffect(() => {
    if (!peerId) return;

    const initializeViewer = () => {
      setLoading(true);

      // Initialiser PeerJS
      const peer = new Peer();
      peerInstanceRef.current = peer;

      peer.on('open', (id) => {
        console.log("Connecté à PeerJS avec ID:", id);
        
        // Appeler le diffuseur (streamer)
        const call = peer.call(peerId, null); // Appeler sans envoyer de flux (null)
        currentCallRef.current = call;

        call.on('stream', (remoteStream) => {
          console.log("Flux distant reçu !");
          if (videoRef.current) {
            videoRef.current.srcObject = remoteStream;
            videoRef.current.play().catch(e => console.warn("Auto-play bloqué, attente d'interaction"));
            setLoading(false);
          }
        });

        call.on('error', (err) => {
          console.error("Erreur d'appel:", err);
          setLoading(false);
        });

        call.on('close', () => {
          console.log("Appel terminé");
        });
      });

      peer.on('error', (err) => {
        console.error("Erreur PeerJS:", err);
        setLoading(false);
      });
    };

    initializeViewer();

    return () => {
      if (currentCallRef.current) {
        currentCallRef.current.close();
      }
      if (peerInstanceRef.current) {
        peerInstanceRef.current.destroy();
      }
    };
  }, [peerId]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="w-full h-full bg-black flex flex-col relative group">
      <div className="relative flex-1 flex items-center justify-center bg-gray-900 overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-white z-10">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="text-sm">Connexion au direct...</p>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          playsInline 
          className="w-full h-full object-contain"
          onClick={toggleMute}
        />

        {/* Overlay Controls */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center z-20">
          <div className="flex items-center gap-4">
            <button onClick={toggleMute} className="text-white hover:text-blue-400 transition">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <div className="text-white">
              <p className="text-sm font-bold truncate max-w-[200px]">{streamTitle}</p>
              <p className="text-[10px] text-gray-300">Direct de {streamer?.firstname || streamer?.name}</p>
            </div>
          </div>
          <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition">
            <Maximize size={24} />
          </button>
        </div>

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