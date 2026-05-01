import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit2, Trash2, Send, X } from 'lucide-react';
import Reply from './Reply';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';

const Comment = ({ id, postId, user_id, author, content, created_at, replies = [] }) => {
  const navigate = useNavigate();
  const { addReply, updateComment, deleteComment } = usePosts();
  const { user: currentUser } = useAuth();

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content);

  // États pour le menu d'options
  const [showOptions, setShowOptions] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef(null);

  const isMyComment = currentUser?.id === user_id;

  // --- LOGIQUE MOBILE : MAINTIEN PROLONGÉ ---
  const handleTouchStart = (e) => {
    if (!isMyComment || isEditing) return;
    const touch = e.touches[0];
    const pos = { x: touch.clientX, y: touch.clientY };

    longPressTimer.current = setTimeout(() => {
      setMenuPosition(pos);
      setShowOptions(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
  };

  const handleTouchEnd = () => clearTimeout(longPressTimer.current);

  // --- LOGIQUE DESKTOP : CLIC 3 POINTS ---
  const handleDesktopMenu = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom });
    setShowOptions(true);
  };

  useEffect(() => {
    const closeMenu = () => setShowOptions(false);
    if (showOptions) window.addEventListener('scroll', closeMenu);
    if (showOptions) window.addEventListener('click', closeMenu);
    return () => {
      window.removeEventListener('scroll', closeMenu);
      window.removeEventListener('click', closeMenu);
    };
  }, [showOptions]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim() || editText === content) return setIsEditing(false);
    await updateComment(id, editText);
    setIsEditing(false);
  };

  return (
    <div className="mb-4">
      <div
        className="flex gap-2 group relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => isMyComment && e.preventDefault()} // Empêche menu système
      >
        <img
          onClick={() => navigate(isMyComment ? '/profile' : `/user/${user_id}`)}
          src={author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${author?.username}`}
          className="w-8 h-8 rounded-full cursor-pointer flex-shrink-0 object-cover"
          alt="avatar"
        />

        <div className="flex flex-col max-w-[85%]">
          <div className="bg-gray-100 px-3 py-2 rounded-2xl relative">
            <h5 className="text-[13px] font-bold text-gray-900">
              {author?.firstname} {author?.lastname || author?.username}
            </h5>

            {isEditing ? (
              <form onSubmit={handleUpdateSubmit} className="mt-1">
                <input
                  autoFocus
                  className="bg-white border border-blue-400 rounded-lg px-2 py-1 text-sm w-full outline-none shadow-inner"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              </form>
            ) : (
              <p className="text-[14px] text-gray-900 leading-snug break-words">{content}</p>
            )}
          </div>

          <div className="flex gap-4 ml-2 mt-0.5 items-center">
            <button onClick={() => setShowReplyInput(!showReplyInput)} className="text-[12px] font-bold text-gray-500 hover:underline">
              Répondre
            </button>
            <span className="text-[11px] text-gray-400">{formatTime(created_at)}</span>

            {/* 3 Points : Masqué sur mobile/tablette, visible au survol sur PC */}
            {isMyComment && !isEditing && (
              <button
                onClick={handleDesktopMenu}
                className="hidden md:block opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
              >
                <MoreHorizontal size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rendu des réponses */}
      <div className="space-y-1">
        {replies.map(reply => <Reply key={reply.id} {...reply} />)}
      </div>

      {/* PORTAL : Menu d'options (Modifier/Supprimer) */}
      {showOptions && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            zIndex: 99999,
            transform: 'translate(-50%, 8px)'
          }}
          className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 rounded-xl py-1 w-40 animate-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { setIsEditing(true); setShowOptions(false); }}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-sm text-gray-700"
          >
            <Edit2 size={16} /> Modifier
          </button>
          <button
            onClick={() => { deleteComment(id); setShowOptions(false); }}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-sm text-red-500 font-medium"
          >
            <Trash2 size={16} /> Supprimer
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Comment;