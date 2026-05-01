import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Edit2,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { usePostsContext } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';
import Comment from './Comment';
import SharePostCard from './SharePostCard';

const PostCard = ({
  id,
  author,
  content,
  image_url,
  created_at,
  likes_count,
  isLikedByMe,
  comments = [],
  total_comments_count,
  parent_post // Données du post original si c'est un partage
}) => {
  const navigate = useNavigate();
  const { toggleLike, addComment, deletePost, updatePost } = usePostsContext();
  const { user: currentUser } = useAuth();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const authorId = author?.id;
  const authorName = author?.username || `${author?.firstname || ''} ${author?.lastname || ''}`.trim() || "Utilisateur";
  const isMe = authorId === currentUser?.id;

  // Fermeture du menu d'options au clic extérieur
  useEffect(() => {
    const closeMenu = () => setShowOptions(false);
    if (showOptions) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [showOptions]);

  const handleUpdatePost = async () => {
    if (!editContent.trim() || editContent === content) {
      setIsEditing(false);
      return;
    }
    await updatePost(id, editContent);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm relative">

      {/* --- HEADER --- */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={() => isMe ? navigate('/profile') : navigate(`/user/${authorId}`)}
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer shadow-sm border border-gray-100"
          >
            <img
              src={author?.avatar_url || `https://ui-avatars.com/api/?name=${authorName}&background=random`}
              className="w-full h-full object-cover"
              alt="avatar"
            />
          </div>
          <div>
            <h4 className="font-bold text-[14px] text-gray-900 leading-tight hover:underline cursor-pointer" onClick={() => isMe ? navigate('/profile') : navigate(`/user/${authorId}`)}>
              {authorName}
            </h4>
            <p className="text-[12px] text-gray-500">{formatTime(created_at)}</p>
          </div>
        </div>

        {isMe && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
            >
              < MoreHorizontal size={20} />
            </button>

            {showOptions && (
              <div className="absolute right-0 mt-2 bg-white shadow-xl border border-gray-100 rounded-xl py-2 w-48 z-[100] animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                <button
                  onClick={() => { setIsEditing(true); setShowOptions(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-sm text-gray-700"
                >
                  <Edit2 size={18} /> Modifier
                </button>
                <button
                  onClick={() => { if (window.confirm("Supprimer ce post ?")) deletePost(id); setShowOptions(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-sm text-red-500 font-medium border-t border-gray-50"
                >
                  <Trash2 size={18} /> Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- CONTENT (Texte du post) --- */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full border border-blue-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"><X size={18} /></button>
              <button onClick={handleUpdatePost} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"><Check size={18} /></button>
            </div>
          </div>
        ) : (
          content && <p className="text-[15px] text-gray-800 whitespace-pre-wrap leading-snug">{content}</p>
        )}
      </div>

      {/* --- BLOC DE PARTAGE (Si parent_post existe) --- */}
      {parent_post && (
        <div
          onClick={() => navigate(`/post/${parent_post.id}`)}
          className="mx-4 mb-3 border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors bg-white shadow-inner"
        >
          <div className="p-3 flex items-center gap-2 border-b border-gray-50 bg-gray-50/30">
            <img src={parent_post.author?.avatar_url || `https://ui-avatars.com/api/?name=${parent_post.author?.username}`} className="w-5 h-5 rounded-full" alt="origin" />
            <span className="font-bold text-xs">{parent_post.author?.username}</span>
            <span className="text-[10px] text-gray-400">• {formatTime(parent_post.created_at)}</span>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600 line-clamp-3">{parent_post.content}</p>
          </div>
          {parent_post.image_url && (
            <img src={parent_post.image_url} className="w-full h-48 object-cover border-t border-gray-100" alt="original-media" />
          )}
        </div>
      )}

      {/* --- IMAGE DU POST (Si pas un partage) --- */}
      {image_url && !parent_post && (
        <div className="border-y border-gray-100 bg-gray-50 flex justify-center">
          <img src={image_url} className="w-full h-auto max-h-[500px] object-contain" alt="media" />
        </div>
      )}

      {/* --- ACTIONS & STATS --- */}
      <div className="px-4 py-2 flex justify-between text-gray-500 text-sm border-b border-gray-50">
        <span className="flex items-center gap-1 font-medium">
          {likes_count > 0 && (
            <><Heart size={14} className="fill-blue-500 text-blue-500" /> {likes_count}</>
          )}
        </span>
        <span className="cursor-pointer hover:underline font-medium" onClick={() => setShowComments(!showComments)}>
          {total_comments_count || 0} {total_comments_count > 1 ? 'commentaires' : 'commentaire'}
        </span>
      </div>

      <div className="px-2 py-1 flex items-center justify-between">
        <button
          onClick={() => toggleLike(id, isLikedByMe)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-sm rounded-lg transition ${isLikedByMe ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Heart size={20} className={isLikedByMe ? "fill-current" : ""} />
          <span>J'aime</span>
        </button>

        <button onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center gap-2 py-2 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
          <MessageCircle size={20} />
          <span>Commenter</span>
        </button>

        <button onClick={() => setShowShareModal(true)} className="flex-1 flex items-center justify-center gap-2 py-2 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
          <Share2 size={20} />
          <span>Partager</span>
        </button>
      </div>

      {/* --- SECTION COMMENTAIRES --- */}
      {showComments && (
        <div className="bg-gray-50/50 p-4 border-t border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (commentText.trim()) { addComment(id, commentText); setCommentText(""); }
            }}
            className="flex gap-2 mb-4"
          >
            <input
              type="text"
              placeholder="Écrire un commentaire..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button type="submit" disabled={!commentText.trim()} className="text-blue-600 disabled:text-gray-300">
              <Send size={18} />
            </button>
          </form>
          <div className="space-y-4">
            {comments.map((comment) => (
              <Comment key={comment.id} postId={id} {...comment} />
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL DE PARTAGE --- */}
      {showShareModal && (
        <SharePostCard
          originalPost={{ id, author, content, image_url, created_at }}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default PostCard;