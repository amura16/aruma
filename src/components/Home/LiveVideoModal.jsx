import React from 'react';
import { X } from 'lucide-react';
import LiveStreamer from '../Live/LiveStreamer';
import LiveChat from '../Live/LiveChat';
import { useAuth } from '../../context/AuthContext';

const LiveVideoModal = ({ closeModal }) => {
  const { user } = useAuth();
  // On utilise un nom de room constant basé sur l'ID user pour le chat
  const roomName = `ArumaLive-${user?.id?.substring(0, 8)}`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md overflow-hidden flex flex-col" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="h-[60px] flex items-center justify-between px-4 bg-gray-900 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
          <h2 className="text-white font-bold text-base">ArumA Studio (P2P)</h2>
        </div>
        <button
          onClick={closeModal}
          className="h-9 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold text-sm transition flex items-center gap-2"
        >
          <X size={18} /> Fermer le studio
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Zone de diffusion P2P */}
        <div className="flex-1 flex items-center justify-center p-4 bg-black overflow-y-auto">
          <div className="w-full max-w-2xl">
            <LiveStreamer onStreamEnd={closeModal} />
          </div>
        </div>

        {/* Chat en direct */}
        <div className="h-[300px] lg:h-full lg:w-[350px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col overflow-hidden">
          <LiveChat roomName={roomName} />
        </div>
      </div>
    </div>
  );
};

export default LiveVideoModal;
