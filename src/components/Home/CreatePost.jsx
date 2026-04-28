import React, { useState } from 'react';
import { Video, Image } from 'lucide-react';
import CreatePostModal from './CreatePostModal';
import LiveVideoModal from './LiveVideoModal'; // Nouveau composant

const CreatePost = ({ userAvatar }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-200">
        <div className="flex gap-3 border-b border-gray-100 pb-4 mb-2">
          <img src={userAvatar} className="w-10 h-10 rounded-full object-cover" alt="me" />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#F0F2F5] hover:bg-gray-200 flex-1 text-left px-4 rounded-full text-gray-500 text-[17px]"
          >
            Quoi de neuf, Felix ?
          </button>
        </div>
        
        <div className="flex justify-between">
          {/* Action : Ouvrir la caméra */}
          <button 
            onClick={() => setIsLiveOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 hover:bg-gray-100 py-2 rounded-lg transition"
          >
            <Video className="text-red-500" size={22} />
            <span className="text-gray-600 font-semibold text-sm">Vidéo direct</span>
          </button>

          <button onClick={() => setIsModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 hover:bg-gray-100 py-2 rounded-lg transition">
            <Image className="text-green-500" size={22} />
            <span className="text-gray-600 font-semibold text-sm">Photo/vidéo</span>
          </button>
        </div>
      </div>

      {isModalOpen && <CreatePostModal userAvatar={userAvatar} closeModal={() => setIsModalOpen(false)} />}
      
      {/* Fenêtre de Caméra Direct */}
      {isLiveOpen && <LiveVideoModal closeModal={() => setIsLiveOpen(false)} />}
    </>
  );
};

export default CreatePost;