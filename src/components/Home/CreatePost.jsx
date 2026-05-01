import React, { useState } from 'react';
import { Video, Image, Smile } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CreatePostModal from './CreatePostModal';
import LiveVideoModal from './LiveVideoModal';

const CreatePost = ({ userAvatar }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const { user } = useAuth();

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstname || 'User'}`;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-200">
        <div className="flex gap-3 border-b border-gray-100 pb-4 mb-2">
          <img
            src={userAvatar || fallbackAvatar}
            className="w-10 h-10 rounded-full object-cover bg-gray-100"
            alt="Profil"
            onError={(e) => { e.target.src = fallbackAvatar }}
          />
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-[#F0F2F5] hover:bg-gray-200 flex-1 flex items-center px-4 rounded-full text-gray-500 text-[17px] cursor-pointer transition-colors"
          >
            Quoi de neuf, {user?.firstname || '...'} ?
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setIsLiveOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 hover:bg-gray-100 py-2 rounded-lg transition"
          >
            <Video className="text-red-500" size={22} />
            <span className="text-gray-600 font-semibold text-sm">Vidéo direct</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 hover:bg-gray-100 py-2 rounded-lg transition"
          >
            <Image className="text-green-500" size={22} />
            <span className="text-gray-600 font-semibold text-sm">Photo/vidéo</span>
          </button>

          <button className="hidden sm:flex flex-1 items-center justify-center gap-2 hover:bg-gray-100 py-2 rounded-lg transition">
            <Smile className="text-yellow-500" size={22} />
            <span className="text-gray-600 font-semibold text-sm">Humeur</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <CreatePostModal
          userAvatar={userAvatar || fallbackAvatar}
          closeModal={() => setIsModalOpen(false)}
        />
      )}

      {isLiveOpen && (
        <LiveVideoModal closeModal={() => setIsLiveOpen(false)} />
      )}
    </>
  );
};

export default CreatePost;