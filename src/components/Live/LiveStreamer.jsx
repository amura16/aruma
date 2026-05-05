import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, X, Play, StopCircle } from 'lucide-react';
import { Peer } from 'peerjs';
import supabase from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const LiveStreamer = ({ onStreamEnd }) => {
  const { user } = useAuth();
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [roomName, setRoomName] = useState(`${user?.firstname}'s Live`);
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const peerRef = useRef(null);
  const activeCallsRef = useRef([]);
  const isMounted = useRef(true);

  // Démarrer la capture vidéo au montage
  useEffect(() => {
    isMounted.current = true;
    startCamera();
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (!isMounted.current) {
        // Si déjà démonté, on arrête tout de suite
        mediaStream.getTracks().forEach(track => track.stop());
        return;
      }

      setStream(mediaStream);
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Erreur caméra:", err);
        alert("Impossible d'accéder à la caméra ou au micro.");
      }
    }
  };

  const cleanup = async () => {
    // 1. Fermer les appels actifs
    if (activeCallsRef.current) {
      activeCallsRef.current.forEach(call => call.close());
      activeCallsRef.current = [];
    }

    // 2. Supprimer de Supabase
    if (user) {
      await supabase.from('active_lives').delete().eq('user_id', user.id);
    }
    // 3. Arrêter les pistes média
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // 4. Détruire l'instance Peer
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
  };

  const stopStream = async () => {
    await cleanup();
    setIsStreaming(false);
    if (onStreamEnd) onStreamEnd();
  };

  const startLive = async () => {
    if (!stream) return;
    setLoading(true);

    try {
      // Initialiser PeerJS
      const newPeer = new Peer();
      
      newPeer.on('open', async (id) => {
        setPeerId(id);
        setPeer(newPeer);
        peerRef.current = newPeer;
        
        // Enregistrer dans Supabase
        const { error } = await supabase.from('active_lives').insert({
          user_id: user.id,
          room_name: roomName,
          peer_id: id
        });

        if (error) {
          console.error("Erreur Supabase:", error);
          newPeer.destroy();
          setLoading(false);
          return;
        }

        setIsStreaming(true);
        setLoading(false);
      });

      newPeer.on('call', (call) => {
        console.log("Appel entrant reçu...");
        // Répondre avec notre flux
        call.answer(stream);
        activeCallsRef.current.push(call);
        
        call.on('close', () => {
          activeCallsRef.current = activeCallsRef.current.filter(c => c !== call);
        });
      });

      newPeer.on('error', (err) => {
        console.error("Erreur PeerJS:", err);
        setLoading(false);
      });

    } catch (err) {
      console.error("Erreur lancement direct:", err);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 max-w-2xl w-full mx-auto">
      <div className="p-4 bg-gray-900 flex justify-between items-center text-white">
        <h3 className="font-bold flex items-center gap-2">
          {isStreaming ? (
            <span className="flex h-3 w-3 rounded-full bg-red-600 animate-pulse"></span>
          ) : (
            <Camera size={20} />
          )}
          {isStreaming ? "En direct" : "Préparation du direct"}
        </h3>
        <button onClick={onStreamEnd} className="hover:bg-white/10 p-1 rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className="aspect-video bg-black relative flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover mirror"
        />
        
        {!stream && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white flex-col gap-2">
            <CameraOff size={48} className="text-gray-600" />
            <p>Accès caméra requis</p>
            <button onClick={startCamera} className="text-blue-400 hover:underline text-sm">Réessayer</button>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        {!isStreaming ? (
          <>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Titre du direct</label>
              <input 
                type="text" 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Ex: Ma séance de sport"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button 
              onClick={startLive}
              disabled={loading || !stream}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? "Initialisation..." : <><Play size={20} /> Lancer le direct</>}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">Votre direct est en cours</p>
              <p className="font-bold text-lg text-blue-600">Partagez votre flux avec le monde !</p>
            </div>
            <button 
              onClick={stopStream}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <StopCircle size={20} /> Arrêter le direct
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreamer;
