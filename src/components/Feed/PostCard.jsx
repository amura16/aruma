import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Edit2, Trash2, Bookmark, X, Check } from 'lucide-react';
import { usePostsContext } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';
import Comment from './Comment';

const PostCard = ({
  id,
  author,
  content,
  image_url,
  created_at,
  likes_count,
  isLikedByMe,
  comments = [],
  total_comments_count
}) => {
  const navigate = useNavigate();
  const { toggleLike, addComment, deletePost, updatePost } = usePostsContext();
  const { user: currentUser } = useAuth();

  // États pour les commentaires
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  // États pour les options du Post
  const [showOptions, setShowOptions] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // États pour l'édition du Post
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const authorId = author?.id;
  const authorName = author?.username || (author?.firstname ? `${author.firstname} ${author.lastname}` : "Utilisateur");
  const authorAvatar = author?.avatar_url;
  const isMe = authorId === currentUser?.id;

  // --- LOGIQUE MENU OPTIONS ---
  const handleOpenOptions = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    // Positionne le menu sous le bouton
    setMenuPosition({ x: rect.left - 130, y: rect.bottom + 8 });
    setShowOptions(true);
  };

  useEffect(() => {
    const closeMenu = () => setShowOptions(false);
    if (showOptions) window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [showOptions]);

  // --- ACTIONS ---
  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(id, commentText);
    setCommentText("");
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim() || editContent === content) {
      setIsEditing(false);
      return;
    }
    await updatePost(id, editContent);
    setIsEditing(false);
  };

  const goToProfile = () => {
    if (!authorId) return;
    isMe ? navigate('/profile') : navigate(`/user/${authorId}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm relative">

      {/* HEADER */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={goToProfile}
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition shadow-sm border border-gray-100"
          >
            <img
              src={authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${authorName}`}
              className="w-full h-full object-cover"
              alt="avatar"
            />
          </div>

          <div>
            <h4 onClick={goToProfile} className="font-bold text-[14px] cursor-pointer hover:underline text-gray-900 leading-tight">
              {authorName}
            </h4>
            <p className="text-[12px] text-gray-500 font-medium">
              {formatTime(created_at)}
            </p>
          </div>
        </div>

        {/* Bouton 3 points pour options du Post */}
        <button
          onClick={handleOpenOptions}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* CONTENU DU POST (Mode Edition ou Normal) */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full border border-blue-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                <X size={18} />
              </button>
              <button onClick={handleUpdatePost} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md">
                <Check size={18} />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[15px] text-gray-800 whitespace-pre-wrap leading-snug">
            {content}
          </p>
        )}
      </div>

      {/* IMAGE */}
      {image_url && !isEditing && (
        <div className="border-y border-gray-100 bg-gray-50 flex justify-center">
          <img src={image_url} className="w-full h-auto max-h-[500px] object-contain" alt="" />
        </div>
      )}

      {/* STATS */}
      <div className="px-4 py-2.5 flex justify-between text-gray-500 text-sm border-b border-gray-50">
        <div className="flex items-center gap-1.5 font-medium">
          {likes_count > 0 && (
            <span className="flex items-center gap-1">
              <div className="bg-blue-500 p-0.5 rounded-full text-white">
                <Heart size={10} className="fill-current" />
              </div>
              {likes_count}
            </span>
          )}
        </div>
        <span className="cursor-pointer hover:underline font-medium" onClick={() => setShowComments(!showComments)}>
          {total_comments_count || 0} {total_comments_count > 1 ? 'commentaires' : 'commentaire'}
        </span>
      </div>

      {/* ACTIONS PRINCIPALES */}
      <div className="px-2 py-1 flex items-center justify-between border-b border-gray-50">
        <button
          onClick={() => toggleLike(id, isLikedByMe)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-sm rounded-lg transition ${isLikedByMe ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Heart size={20} className={isLikedByMe ? "fill-current" : ""} />
          <span>{isLikedByMe ? 'Aimé' : 'J\'aime'}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <MessageCircle size={20} />
          <span>Commenter</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <Share2 size={20} />
          <span>Partager</span>
        </button>
      </div>

      {/* SECTION COMMENTAIRES */}
      {showComments && (
        <div className="bg-gray-50/50 p-4 animate-in fade-in duration-300">
          <form onSubmit={handleSendComment} className="flex gap-2 mb-6">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
              <img src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username}`} className="w-full h-full object-cover" alt="Me" />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Écrire un commentaire..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full py-1.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button type="submit" disabled={!commentText.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 disabled:text-gray-300 transition-colors">
                <Send size={16} />
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Comment key={comment.id} postId={id} {...comment} />
              ))
            ) : (
              <p className="text-center text-gray-400 text-xs py-2">Aucun commentaire pour le moment.</p>
            )}
          </div>
        </div>
      )}

      {/* MENU PORTAL POUR LES OPTIONS DU POST (Modifier/Supprimer/Sauvegarder) */}
      {showOptions && createPortal(
        <div
          style={{ position: 'fixed', top: `${menuPosition.y}px`, left: `${menuPosition.x}px`, zIndex: 9999 }}
          className="bg-white shadow-xl border border-gray-100 rounded-xl py-2 w-48 animate-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Option Sauvegarder (Toujours visible) */}
          <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-sm text-gray-700 transition-colors">
            <Bookmark size={18} /> Sauvegarder le post
          </button>

          {/* Options réservées à l'auteur */}
          {isMe && (
            <>
              <div className="h-[1px] bg-gray-100 my-1" />
              <button
                onClick={() => { setIsEditing(true); setShowOptions(false); }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-sm text-gray-700 transition-colors"
              >
                <Edit2 size={18} /> Modifier le post
              </button>
              <button
                onClick={() => { deletePost(id); setShowOptions(false); }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-sm text-red-500 font-medium transition-colors"
              >
                <Trash2 size={18} /> Supprimer le post
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default PostCard;