import React, { useState } from 'react';
import { X, Image, User2, Smile, MapPin, MoreHorizontal } from 'lucide-react';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../context/AuthContext';

const CreatePostModal = ({ userAvatar, closeModal }) => {
  const [content, setContent] = useState("");
  const { createPost } = usePosts();
  const { user } = useAuth();

  const handlePost = async () => {
    if (!content.trim()) return;
    await createPost(content);
    closeModal();
    setContent("");
  };

  const userName = user ? `${user.firstname} ${user.lastname}` : "Utilisateur ArumA";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
      {/* Overlay sombre derrière la modale */}
      <div className="fixed inset-0 bg-black/20" onClick={closeModal}></div>

      {/* Conteneur de la Modale */}
      <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="w-8"></div> {/* Spacer */}
          <h2 className="text-xl font-bold text-gray-800">Créer une publication</h2>
          <button 
            onClick={closeModal}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 flex items-center gap-3">
          <img src={userAvatar} className="w-10 h-10 rounded-full object-cover" alt="me" />
          <div>
            <p className="font-bold text-gray-900">{userName}</p>
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md w-fit">
              <User2 size={12} />
              <span className="text-[12px] font-semibold">Public</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="px-4">
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Quoi de neuf, ${user?.firstname || '...'} ?`}
            className="w-full min-h-[150px] text-xl placeholder:text-gray-400 border-none focus:ring-0 resize-none"
          />
        </div>

        {/* Add to post bar */}
        <div className="mx-4 p-3 border border-gray-200 rounded-lg flex items-center justify-between mb-4">
          <span className="font-bold text-[15px] text-gray-700">Ajouter à votre publication</span>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Image className="text-green-500" size={24} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Smile className="text-yellow-500" size={24} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <MapPin className="text-red-500" size={24} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <MoreHorizontal className="text-gray-500" size={24} />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-4 pb-4">
          <button
            disabled={!content.trim()}
            onClick={handlePost}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 rounded-lg transition-all"
          >
            Publier
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;