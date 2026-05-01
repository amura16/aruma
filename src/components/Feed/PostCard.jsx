import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
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
  const { toggleLike, addComment } = usePostsContext();
  const { user: currentUser } = useAuth();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Extraction et formatage des infos auteur
  const authorId = author?.id;
  const authorName = author?.username || (author?.firstname ? `${author.firstname} ${author.lastname}` : "Utilisateur");
  const authorAvatar = author?.avatar_url;

  // Vérifier si c'est le profil de l'utilisateur connecté
  const isMe = authorId === currentUser?.id;

  const goToProfile = () => {
    if (!authorId) return;
    if (isMe) {
      navigate('/profile');
    } else {
      navigate(`/user/${authorId}`);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(id, commentText);
    setCommentText("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">

      {/* HEADER : Infos Auteur */}
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
            <h4
              onClick={goToProfile}
              className="font-bold text-[14px] cursor-pointer hover:underline text-gray-900 leading-tight"
            >
              {authorName}
            </h4>
            <p className="text-[12px] text-gray-500 font-medium">
              {formatTime(created_at)}
            </p>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>
      </div>

      {/* CONTENU DU POST */}
      <div className="px-4 pb-3">
        <p className="text-[15px] text-gray-800 whitespace-pre-wrap leading-snug">
          {content}
        </p>
      </div>

      {/* IMAGE DU POST */}
      {image_url && (
        <div className="border-y border-gray-100 bg-gray-50 flex justify-center">
          <img src={image_url} className="w-full h-auto max-h-[500px] object-contain" alt="Post" />
        </div>
      )}

      {/* STATS : Likes et Compteur total (Commentaires + Réponses) */}
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
        <span
          className="cursor-pointer hover:underline font-medium"
          onClick={() => setShowComments(!showComments)}
        >
          {total_comments_count || 0} {total_comments_count > 1 ? 'commentaires' : 'commentaire'}
        </span>
      </div>

      {/* ACTIONS PRINCIPALES */}
      <div className="px-2 py-1 flex items-center justify-between border-b border-gray-50">
        <button
          onClick={() => toggleLike(id, isLikedByMe)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-sm rounded-lg transition ${isLikedByMe ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
            }`}
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
          {/* Formulaire d'envoi */}
          <form onSubmit={handleSendComment} className="flex gap-2 mb-6">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
              <img
                src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username}`}
                className="w-full h-full object-cover"
                alt="Me"
              />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Écrire un commentaire..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full py-1.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 disabled:text-gray-300 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>

          {/* Liste des commentaires mappée */}
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  postId={id}
                  {...comment}
                />
              ))
            ) : (
              <p className="text-center text-gray-400 text-xs py-2">Aucun commentaire pour le moment.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;