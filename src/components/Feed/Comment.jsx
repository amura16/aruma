import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MoreHorizontal, Edit2, Trash2, X } from 'lucide-react';
import Reply from './Reply';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';

const Comment = ({ id, postId, user_id, author, content, created_at, replies = [] }) => {
  const navigate = useNavigate();
  const { addReply, updateComment, deleteComment } = usePosts();
  const { user: currentUser } = useAuth();

  // États pour la gestion locale
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content);
  const [showOptions, setShowOptions] = useState(false);

  const isMyComment = currentUser?.id === user_id;

  // Actions
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editText.trim() || editText === content) return setIsEditing(false);
    await updateComment(id, editText);
    setIsEditing(false);
    setShowOptions(false);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await addReply(id, replyText);
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2 group relative">
        {/* Avatar */}
        <div
          onClick={() => navigate(isMyComment ? '/profile' : `/user/${user_id}`)}
          className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer"
        >
          <img
            src={author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${author?.username}`}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col max-w-[85%]">
          {/* Bulle de commentaire */}
          <div className="bg-gray-100 px-3 py-2 rounded-2xl relative">
            <h5 className="text-[13px] font-bold text-gray-900 leading-tight">
              {author?.firstname} {author?.lastname || author?.username}
            </h5>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="flex flex-col gap-1 mt-1">
                <input
                  autoFocus
                  className="bg-white border border-blue-400 rounded-lg px-2 py-1 text-sm w-full focus:outline-none"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <button type="button" onClick={() => setIsEditing(false)} className="text-[10px] text-red-500 text-left ml-1">Annuler</button>
              </form>
            ) : (
              <p className="text-[14px] text-gray-900 leading-snug break-words">
                {content}
              </p>
            )}
          </div>

          {/* Actions (Répondre, Temps, Options) */}
          <div className="flex gap-4 ml-2 mt-0.5 items-center">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-[12px] font-bold text-gray-500 hover:underline"
            >
              Répondre
            </button>
            <span className="text-[11px] text-gray-400">
              {formatTime(created_at)}
            </span>

            {isMyComment && !isEditing && (
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <MoreHorizontal size={14} />
                </button>

                {showOptions && (
                  <div className="absolute left-0 top-full mt-1 bg-white shadow-xl border border-gray-100 rounded-lg py-1 z-20 w-32">
                    <button
                      onClick={() => { setIsEditing(true); setShowOptions(false); }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 w-full text-gray-700"
                    >
                      <Edit2 size={12} /> Modifier
                    </button>
                    <button
                      onClick={() => { deleteComment(id); setShowOptions(false); }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 w-full text-red-500 font-medium"
                    >
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Liste des réponses (Replies) */}
      <div className="space-y-1">
        {replies.map((reply) => (
          <Reply key={reply.id} {...reply} />
        ))}
      </div>

      {/* Formulaire de réponse */}
      {showReplyInput && (
        <form onSubmit={handleReplySubmit} className="flex items-center gap-2 mt-2 ml-10 animate-in fade-in slide-in-from-top-1">
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
            <img src={currentUser?.avatar_url} alt="me" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 relative">
            <input
              autoFocus
              type="text"
              placeholder="Répondre..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-gray-100 rounded-full py-1.5 px-3 pr-8 text-[12px] focus:outline-none focus:bg-gray-200 transition-all"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 disabled:text-gray-300"
            >
              <Send size={14} />
            </button>
          </div>
          <button type="button" onClick={() => setShowReplyInput(false)} className="text-gray-400">
            <X size={14} />
          </button>
        </form>
      )}
    </div>
  );
};

export default Comment;