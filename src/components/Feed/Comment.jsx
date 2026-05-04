import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit2, Trash2, X, Check, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext'; // Vérifie le chemin
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Reply from './Reply';

const Comment = ({ id, postId, user_id, author, content, created_at, replies = [] }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { updateComment, deleteComment, addReply } = usePosts();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const isMyComment = currentUser?.id === user_id;

  useEffect(() => {
    const handleAutoClose = () => { if (showOptions) setShowOptions(false); };
    if (showOptions) {
      window.addEventListener('click', handleAutoClose);
      window.addEventListener('scroll', handleAutoClose, true);
    }
    return () => {
      window.removeEventListener('click', handleAutoClose);
      window.removeEventListener('scroll', handleAutoClose, true);
    };
  }, [showOptions]);

  const handleOpenMenu = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom });
    setShowOptions(true);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || isSending) return;
    setIsSending(true);
    try {
      const mention = `@${author?.username} `;
      await addReply(id, mention + replyText.trim());
      setReplyText("");
      setShowReplyInput(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim() || editText === content) {
      setIsEditing(false);
      return;
    }
    await updateComment(id, editText.trim());
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col mb-4 group">
      <div className="flex gap-2 relative">
        <img
          onClick={() => navigate(`/user/${user_id}`)}
          src={author?.avatar_url || `https://ui-avatars.com/api/?name=${author?.username}`}
          className="w-8 h-8 rounded-full cursor-pointer object-cover flex-shrink-0"
          alt="avatar"
        />

        <div className="flex flex-col max-w-[85%] min-w-0">
          <div className="bg-gray-100 px-3 py-2 rounded-2xl relative">
            <h5 className="text-[12px] font-bold text-gray-900 truncate">
              {author?.username}
            </h5>

            {isEditing ? (
              <form onSubmit={handleUpdateSubmit} className="mt-1 flex items-center gap-2">
                <input
                  autoFocus
                  className="bg-white border border-blue-400 rounded-lg px-2 py-1 text-sm w-full outline-none"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <button type="submit" className="text-green-600"><Check size={16} /></button>
                <button type="button" onClick={() => setIsEditing(false)} className="text-red-400"><X size={16} /></button>
              </form>
            ) : (
              <p className="text-sm text-gray-800 break-words leading-snug">{content}</p>
            )}
          </div>

          <div className="flex gap-4 ml-2 mt-1 items-center">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className={`text-[11px] font-bold hover:underline ${showReplyInput ? 'text-blue-600' : 'text-gray-500'}`}
            >
              Répondre
            </button>
            <span className="text-[11px] text-gray-400">
              {created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: fr }) : ""}
            </span>

            {isMyComment && !isEditing && (
              <button onClick={handleOpenMenu} className="opacity-0 group-hover:opacity-100 text-gray-400 p-1">
                <MoreHorizontal size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyInput && (
        <div className="ml-10 mt-2">
          <form onSubmit={handleReplySubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                autoFocus
                disabled={isSending}
                className="w-full bg-white border border-gray-200 rounded-full py-1.5 px-4 text-xs outline-none focus:border-blue-400"
                placeholder={`Répondre à ${author?.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button type="submit" disabled={!replyText.trim() || isSending} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600">
                {isSending ? <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </form>
        </div>
      )}

      {replies.length > 0 && (
        <div className="ml-10 mt-2 space-y-1 border-l-2 border-gray-100 pl-2">
          {replies.map((reply) => (
            <Reply key={reply.id} comment_id={id} {...reply} />
          ))}
        </div>
      )}

      {showOptions && createPortal(
        <div
          className="fixed z-[9999] bg-white shadow-xl border rounded-xl py-1 w-40"
          style={{ top: menuPosition.y + 5, left: menuPosition.x - 80 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => { setIsEditing(true); setShowOptions(false); }} className="flex items-center gap-3 px-4 py-2 text-[13px] hover:bg-gray-50 w-full text-gray-700">
            <Edit2 size={14} /> Modifier
          </button>
          <button onClick={() => { if (window.confirm("Supprimer ?")) deleteComment(id); setShowOptions(false); }} className="flex items-center gap-3 px-4 py-2 text-[13px] hover:bg-gray-50 w-full text-red-500">
            <Trash2 size={14} /> Supprimer
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Comment;