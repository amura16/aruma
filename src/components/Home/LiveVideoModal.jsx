import React, { useEffect, useRef, useState } from 'react';
import { X, VideoOff, Mic, MicOff, Settings } from 'lucide-react';

const LiveVideoModal = ({ closeModal }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  // Démarrer la caméra
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Erreur caméra:", err);
        setError("Accès à la caméra refusé ou non supporté.");
      }
    };

    startCamera();

    // Arrêter la caméra quand on ferme la modale
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black">
      {/* Header Sombre */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
        <h2 className="text-white font-bold text-lg">Vidéo en direct</h2>
        <button onClick={closeModal} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition">
          <X size={24} />
        </button>
      </div>

      {/* Affichage de la Vidéo */}
      <div className="relative w-full h-full flex items-center justify-center">
        {error ? (
          <div className="text-white text-center p-6">
            <VideoOff size={48} className="mx-auto mb-4 text-gray-500" />
            <p>{error}</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted // Muter pour éviter le larsen (feedback audio) local
            className="w-full h-full object-cover md:rounded-xl md:max-w-[90%] md:max-h-[80%]"
          />
        )}
      </div>

      {/* Barre de contrôle inférieure */}
      {!error && (
        <div className="absolute bottom-10 flex flex-col items-center gap-4 w-full">
          <div className="flex gap-4">
            <button className="p-4 bg-white/20 hover:bg-white/30 rounded-full text-white">
              <Mic size={24} />
            </button>
            <button className="p-4 bg-white/20 hover:bg-white/30 rounded-full text-white">
              <Settings size={24} />
            </button>
          </div>
          
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-transform active:scale-95">
            Lancer le direct
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveVideoModal;