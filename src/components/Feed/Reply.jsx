import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../hooks/usePosts';
import { formatTime } from '../../utils/formatTime';

const Reply = ({ id, user_id, author, content, created_at }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { updateReply, deleteReply } = usePosts();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content);
  const [showOptions, setShowOptions] = useState(false);

  const isMyReply = currentUser?.id === user_id;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editText.trim() || editText === content) return setIsEditing(false);
    await updateReply(id, editText);
    setIsEditing(false);
    setShowOptions(false);
  };

  return (
    <div className="flex gap-2 mt-2 ml-10 group relative">
      {/* Avatar */}
      <div
        onClick={() => navigate(isMyReply ? '/profile' : `/user/${user_id}`)}
        className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer"
      >
        <img
          src={author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${author?.username}`}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col max-w-[90%]">
        {/* Bulle de réponse */}
        <div className="bg-gray-100 px-3 py-1.5 rounded-2xl">
          <h5 className="text-[12px] font-bold text-gray-900 leading-tight">
            {author?.firstname} {author?.lastname || author?.username}
          </h5>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="mt-1">
              <input
                autoFocus
                className="bg-white border border-blue-400 rounded px-2 py-0.5 text-xs w-full focus:outline-none"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <button type="button" onClick={() => setIsEditing(false)} className="text-[9px] text-red-500">Annuler</button>
            </form>
          ) : (
            <p className="text-[13px] text-gray-900 leading-tight break-words">
              {content}
            </p>
          )}
        </div>

        {/* Pied de réponse (Temps & Options) */}
        <div className="flex gap-3 ml-2 mt-0.5 items-center">
          <span className="text-[11px] text-gray-400 font-normal">
            {formatTime(created_at)}
          </span>

          {isMyReply && !isEditing && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <MoreHorizontal size={12} />
              </button>

              {showOptions && (
                <div className="absolute left-0 top-full mt-1 bg-white shadow-xl border border-gray-100 rounded-lg py-1 z-20 w-28">
                  <button
                    onClick={() => { setIsEditing(true); setShowOptions(false); }}
                    className="flex items-center gap-2 px-2.5 py-1 text-[10px] hover:bg-gray-50 w-full text-gray-700"
                  >
                    <Edit2 size={10} /> Modifier
                  </button>
                  <button
                    onClick={() => { deleteReply(id); setShowOptions(false); }}
                    className="flex items-center gap-2 px-2.5 py-1 text-[10px] hover:bg-gray-50 w-full text-red-500"
                  >
                    <Trash2 size={10} /> Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reply;