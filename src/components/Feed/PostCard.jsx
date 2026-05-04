import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit3, Send, CornerDownRight } from 'lucide-react';
import { usePostsContext } from '../../context/PostContext';
import { useComments } from '../../context/CommentContext'; // Nouvel import
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const PostCard = ({ 
  id, content, image_url, created_at, author, likes_count, comments_count, isLikedByMe, user_id,
  comments = [] 
}) => {
  // Actions liées au Post
  const { toggleLike, deletePost } = usePostsContext();
  
  // Actions liées aux Commentaires isolées
  const { 
    addComment, 
    deleteComment, 
    addReply, 
    deleteReply,
    updateComment, // Disponible si tu en as besoin pour l'édition
    updateReply 
  } = useComments();

  const { user } = useAuth();
  
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  // --- LOGIQUE POST ---
  const handleLike = async () => {
    if (isLiking || !user) return;
    setIsLiking(true);
    try { await toggleLike(id, isLikedByMe); } finally { setIsLiking(false); }
  };

  const handleDeletePost = async () => {
    if (window.confirm("Supprimer ce post ?")) {
      try { await deletePost(id); } catch (err) { alert("Erreur suppression"); }
    }
  };

  // --- LOGIQUE COMMENTAIRES (Utilise useComments) ---
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      if (replyTo) {
        await addReply(replyTo.id, commentText);
        setReplyTo(null);
      } else {
        await addComment(id, commentText);
      }
      setCommentText("");
    } catch (err) { alert("Erreur lors de l'envoi"); }
  };

  const dateFormatted = created_at 
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: fr })
    : "";

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 shadow-sm">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={author?.avatar_url || `https://ui-avatars.com/api/?name=${author?.username || 'User'}`} 
            className="w-10 h-10 rounded-full object-cover border" alt="avatar"
          />
          <div>
            <h4 className="font-bold text-gray-900 text-[15px]">{author?.username || "Anonyme"}</h4>
            <p className="text-xs text-gray-500">{dateFormatted}</p>
          </div>
        </div>
        {user?.id === user_id && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-xl z-10 py-1">
                <button onClick={handleDeletePost} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
      </div>
      {image_url && (
        <div className="border-y bg-gray-50">
          <img src={image_url} alt="Post" className="w-full max-h-[500px] object-contain mx-auto" />
        </div>
      )}

      {/* Stats & Actions */}
      <div className="px-4 py-2 flex justify-between text-[13px] text-gray-500 border-b border-gray-50">
        <span>{likes_count > 0 ? `${likes_count} J'aime` : ""}</span>
        <span onClick={() => setShowComments(!showComments)} className="hover:underline cursor-pointer">
          {comments_count > 0 ? `${comments_count} commentaires` : "0 commentaire"}
        </span>
      </div>

      <div className="flex items-center p-1 px-2">
        <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm ${isLikedByMe ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
          <Heart size={20} className={isLikedByMe ? "fill-current" : ""} /> J'aime
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm">
          <MessageCircle size={20} /> Commenter
        </button>
      </div>

      {/* SECTION COMMENTAIRES */}
      {showComments && (
        <div className="px-4 pb-4 border-t pt-3 bg-gray-50/50">
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.username}`} className="w-8 h-8 rounded-full" alt="me" />
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder={replyTo ? `Répondre à ${replyTo.username}...` : "Écrivez un commentaire..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
              {replyTo && (
                <button onClick={() => setReplyTo(null)} className="absolute right-10 top-2 text-xs text-gray-400 hover:text-red-500">Annuler</button>
              )}
              <button type="submit" className="absolute right-2 top-1.5 text-blue-600 p-1"><Send size={16} /></button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex gap-2 group">
                  <img src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${comment.author?.username}`} className="w-8 h-8 rounded-full" alt="author" />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full relative">
                      <p className="text-xs font-bold">{comment.author?.username}</p>
                      <p className="text-sm">{comment.content}</p>
                      
                      {user?.id === comment.user_id && (
                        <button onClick={() => deleteComment(comment.id)} className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3 ml-2 mt-1 text-xs font-bold text-gray-500">
                      <button onClick={() => setReplyTo({id: comment.id, username: comment.author?.username})} className="hover:underline">Répondre</button>
                      <span>{formatDistanceToNow(new Date(comment.created_at), { locale: fr })}</span>
                    </div>

                    {comment.replies && comment.replies.map(reply => (
                      <div key={reply.id} className="flex gap-2 mt-3 ml-4">
                        <CornerDownRight size={16} className="text-gray-300" />
                        <img src={reply.author?.avatar_url || `https://ui-avatars.com/api/?name=${reply.author?.username}`} className="w-6 h-6 rounded-full" alt="reply-author" />
                        <div className="flex-1">
                          <div className="bg-white border border-gray-100 rounded-2xl px-3 py-1.5 inline-block group relative">
                            <p className="text-[11px] font-bold">{reply.author?.username}</p>
                            <p className="text-sm">{reply.content}</p>
                            {user?.id === reply.user_id && (
                              <button onClick={() => deleteReply(reply.id)} className="absolute -right-7 top-1 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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