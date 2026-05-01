import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Bookmark } from 'lucide-react';
import { usePostsContext } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';

const PostCard = ({ id, author, content, image_url, created_at, likes_count, isLikedByMe, comments }) => {
  const { toggleLike, addComment } = usePostsContext();
  const { user: currentUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const authorName = author?.username || (author?.firstname ? `${author.firstname} ${author.lastname}` : "Utilisateur");
  const authorAvatar = author?.avatar_url;

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${authorName}`} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
          <div>
            <h4 className="font-bold text-[14px]">{authorName}</h4>
            <p className="text-[12px] text-gray-500">{formatTime(created_at)}</p>
          </div>
        </div>
        <MoreHorizontal size={20} className="text-gray-500 cursor-pointer" />
      </div>

      <div className="px-4 pb-3">
        <p className="text-[15px] whitespace-pre-wrap">{content}</p>
      </div>

      {image_url && <img src={image_url} className="w-full h-auto border-y border-gray-100" alt="Post" />}

      <div className="px-4 py-2 flex justify-between text-gray-500 text-sm">
        <span>{likes_count || 0} J'aime</span>
        <span className="cursor-pointer" onClick={() => setShowComments(!showComments)}>{comments?.length || 0} commentaires</span>
      </div>

      <div className="px-2 py-1 border-t border-gray-100 flex items-center">
        <button onClick={() => toggleLike(id, isLikedByMe)} className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold ${isLikedByMe ? 'text-red-500' : 'text-gray-600'}`}>
          <Heart size={20} className={isLikedByMe ? "fill-current" : ""} /> Aimé
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center gap-2 py-2 font-bold text-gray-600">
          <MessageCircle size={20} /> Commenter
        </button>
      </div>
    </div>
  );
};

export default PostCard;