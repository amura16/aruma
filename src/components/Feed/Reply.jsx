import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef(null);

  const isMyReply = currentUser?.id === user_id;

  const handleTouchStart = (e) => {
    if (!isMyReply || isEditing) return;
    const touch = e.touches[0];
    const pos = { x: touch.clientX, y: touch.clientY };
    longPressTimer.current = setTimeout(() => {
      setMenuPosition(pos);
      setShowOptions(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
  };

  const handleTouchEnd = () => clearTimeout(longPressTimer.current);

  const handleDesktopMenu = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom });
    setShowOptions(true);
  };

  useEffect(() => {
    const closeMenu = () => setShowOptions(false);
    if (showOptions) window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [showOptions]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim() || editText === content) return setIsEditing(false);
    await updateReply(id, editText);
    setIsEditing(false);
  };

  return (
    <div
      className="flex gap-2 mt-2 ml-10 group relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => isMyReply && e.preventDefault()}
    >
      <img
        onClick={() => navigate(isMyReply ? '/profile' : `/user/${user_id}`)}
        src={author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${author?.username}`}
        className="w-6 h-6 rounded-full cursor-pointer flex-shrink-0 object-cover"
        alt="avatar"
      />

      <div className="flex flex-col max-w-[90%]">
        <div className="bg-gray-100 px-3 py-1.5 rounded-2xl">
          <h5 className="text-[12px] font-bold text-gray-900">{author?.username}</h5>
          {isEditing ? (
            <form onSubmit={handleUpdateSubmit} className="mt-1">
              <input
                autoFocus
                className="bg-white border border-blue-400 rounded px-2 py-0.5 text-xs w-full outline-none"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            </form>
          ) : (
            <p className="text-[13px] text-gray-900 leading-tight break-words">{content}</p>
          )}
        </div>

        <div className="flex gap-3 ml-2 mt-0.5 items-center">
          <span className="text-[11px] text-gray-400">{formatTime(created_at)}</span>
          {isMyReply && !isEditing && (
            <button
              onClick={handleDesktopMenu}
              className="hidden md:block opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
            >
              <MoreHorizontal size={14} />
            </button>
          )}
        </div>
      </div>

      {showOptions && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            zIndex: 99999,
            transform: 'translate(-50%, 8px)'
          }}
          className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-gray-100 rounded-xl py-1 w-36 animate-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { setIsEditing(true); setShowOptions(false); }}
            className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 w-full text-gray-700"
          >
            <Edit2 size={14} /> Modifier
          </button>
          <button
            onClick={() => { deleteReply(id); setShowOptions(false); }}
            className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 w-full text-red-500 font-medium"
          >
            <Trash2 size={14} /> Supprimer
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Reply;