import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit3, Send } from 'lucide-react';
import { usePostsContext } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// On destructure directement les props envoyées par {...post} depuis Home.jsx
const PostCard = ({ 
  id, 
  content, 
  image_url, 
  created_at, 
  author, 
  likes_count, 
  comments_count, 
  isLikedByMe, 
  user_id,
  comments = [] // On récupère les commentaires s'ils sont chargés
}) => {
  const { toggleLike, deletePost, addComment } = usePostsContext();
  const { user } = useAuth();
  
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Gestion du Like avec protection
  const handleLike = async () => {
    if (isLiking || !user) return;
    setIsLiking(true);
    try {
      await toggleLike(id, isLikedByMe);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Supprimer ce post ?")) {
      try {
        await deletePost(id);
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment(id, commentText);
      setCommentText("");
    } catch (err) {
      alert("Erreur commentaire");
    }
  };

  const dateFormatted = created_at 
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: fr })
    : "";

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 shadow-sm transition hover:shadow-md">
      {/* Header : Infos auteur */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={author?.avatar_url || `https://ui-avatars.com/api/?name=${author?.username || 'User'}`} 
            alt="avatar" 
            className="w-10 h-10 rounded-full object-cover border border-gray-100"
          />
          <div>
            <h4 className="font-bold text-gray-900 text-[15px] hover:underline cursor-pointer">
              {author?.username || "Utilisateur anonyme"}
            </h4>
            <p className="text-xs text-gray-500">{dateFormatted}</p>
          </div>
        </div>

        {user?.id === user_id && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
              <MoreHorizontal size={18} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-xl z-10 py-1">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Edit3 size={14} /> Modifier
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Corps : Texte et Image */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {image_url && (
        <div className="border-y border-gray-50 bg-gray-50">
          <img 
            src={image_url} 
            alt="Post content" 
            className="w-full max-h-[500px] object-contain mx-auto"
            loading="lazy"
          />
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex justify-between items-center text-[13px] text-gray-500 border-b border-gray-50">
        <div className="flex items-center gap-1">
          {likes_count > 0 && (
            <div className="flex items-center">
              <span className="flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full mr-1">
                <Heart size={10} className="fill-white text-white" />
              </span>
              <span>{likes_count}</span>
            </div>
          )}
        </div>
        <div 
          onClick={() => setShowComments(!showComments)}
          className="hover:underline cursor-pointer"
        >
          {comments_count > 0 ? `${comments_count} commentaires` : "0 commentaire"}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center p-1 px-2 gap-1">
        <button 
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors font-semibold text-sm ${
            isLikedByMe 
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Heart size={20} className={isLikedByMe ? "fill-current" : ""} />
          <span>J'aime</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm"
        >
          <MessageCircle size={20} />
          <span>Commenter</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm">
          <Share2 size={20} />
          <span>Partager</span>
        </button>
      </div>

      {/* Section Commentaires (Apparaît au clic sur Commenter) */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          {/* Formulaire ajout commentaire */}
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.username}`} 
              className="w-8 h-8 rounded-full" 
              alt="me"
            />
            <div className="flex-1 relative">
              <input 
                type="text"
                placeholder="Écrivez un commentaire..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="submit" className="absolute right-2 top-1.5 text-blue-600 hover:bg-blue-50 p-1 rounded-full">
                <Send size={16} />
              </button>
            </div>
          </form>

          {/* Liste des commentaires */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <img 
                  src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${comment.author?.username}`} 
                  className="w-8 h-8 rounded-full" 
                  alt="author"
                />
                <div className="bg-gray-100 rounded-2xl px-3 py-2 max-w-[90%]">
                  <p className="text-xs font-bold text-gray-900">{comment.author?.username}</p>
                  <p className="text-sm text-gray-800">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;