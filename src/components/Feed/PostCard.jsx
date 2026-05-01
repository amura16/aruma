import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Bookmark } from 'lucide-react';
import { usePostsContext } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';

const PostCard = ({ id, author, content, image_url, created_at, likes_count, isLikedByMe, comments }) => {
  const navigate = useNavigate();
  const { toggleLike, addComment } = usePostsContext();
  const { user: currentUser } = useAuth();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Extraction des infos auteur
  const authorId = author?.id;
  const authorName = author?.username || (author?.firstname ? `${author.firstname} ${author.lastname}` : "Utilisateur");
  const authorAvatar = author?.avatar_url;

  // Vérifier si c'est le profil de l'utilisateur connecté
  const isMe = authorId === currentUser?.id;

  // Fonction de navigation vers le profil
  const goToProfile = () => {
    if (!authorId) return;
    // Si c'est mon post, on va sur /profile, sinon sur /user/:id
    if (isMe) {
      navigate('/profile');
    } else {
      navigate(`/user/${authorId}`);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">

      {/* HEADER : Cliquable pour mener au profil */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar cliquable */}
          <div
            onClick={goToProfile}
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition shadow-sm"
          >
            <img
              src={authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${authorName}`}
              className="w-full h-full object-cover"
              alt="avatar"
            />
          </div>

          <div>
            {/* Nom cliquable */}
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

      {/* IMAGE */}
      {image_url && (
        <div className="border-y border-gray-100 bg-gray-50 flex justify-center">
          <img src={image_url} className="w-full h-auto max-h-[500px] object-contain" alt="Post" />
        </div>
      )}

      {/* STATS */}
      <div className="px-4 py-2.5 flex justify-between text-gray-500 text-sm border-b border-gray-50">
        <div className="flex items-center gap-1.5 font-medium">
          {likes_count > 0 && (
            <span className="flex items-center gap-1">
              <div className="bg-blue-500 p-0.5 rounded-full text-white"><Heart size={10} className="fill-current" /></div>
              {likes_count}
            </span>
          )}
        </div>
        <span
          className="cursor-pointer hover:underline font-medium"
          onClick={() => setShowComments(!showComments)}
        >
          {comments?.length || 0} {comments?.length > 1 ? 'commentaires' : 'commentaire'}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="px-2 py-1 flex items-center justify-between">
        <button
          onClick={() => toggleLike(id, isLikedByMe)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-sm rounded-lg transition ${isLikedByMe ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:bg-gray-100'}`}
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
    </div>
  );
};

export default PostCard;