import React, { useState, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Trash2, 
  Send, 
  CornerDownRight,
  Edit2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePostsContext } from '../../context/PostContext';
import { useComments } from '../../context/CommentContext';
import { useAuth } from '../../context/AuthContext';
import { useShare } from '../../hooks/useShare';
import SharePostCard from './SharePostCard';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const PostCard = (post) => {
  // Extraction des données incluant parent_id et parent_post pour le partage
  const { 
    id, content, image_url, created_at, author, 
    likes_count, comments_count, isLikedByMe, user_id,
    parent_id, parent_post, // Ajout de ces deux champs
    comments = [] 
  } = post;

  const { toggleLike, deletePost, updatePost } = usePostsContext();
  const { addComment, deleteComment, addReply, deleteReply, updateComment, updateReply } = useComments();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  // États pour l'édition
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(content);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  
  // Menu actif pour commentaires/réponses
  const [activeMenuId, setActiveMenuId] = useState(null);
  const touchTimer = useRef(null);

  const { isShareModalOpen, openShareModal, closeShareModal } = useShare();

  const handleLike = async () => {
    if (isLiking || !user) return;
    setIsLiking(true);
    try { 
      await toggleLike(id, isLikedByMe); 
    } finally { 
      setIsLiking(false); 
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm("Supprimer cette publication ?")) {
      try { 
        await deletePost(id); 
      } catch (err) { 
        console.error(err);
      }
    }
  };

  const handleUpdatePost = async () => {
    if (!editPostContent.trim()) return;
    try {
      await updatePost(id, editPostContent);
      setIsEditingPost(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentContent.trim()) return;
    try {
      await updateComment(commentId, editCommentContent);
      setEditingCommentId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReply = async (replyId) => {
    if (!editReplyContent.trim()) return;
    try {
      await updateReply(replyId, editReplyContent);
      setEditingReplyId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Gestion du Long Press pour mobile
  const handleTouchStart = (id, type) => {
    touchTimer.current = setTimeout(() => {
      setActiveMenuId(`${type}-${id}`);
    }, 600); // 600ms pour déclencher le menu
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
  };

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
    } catch (err) {
      alert("Erreur lors de l'envoi du commentaire");
    }
  };

  const dateFormatted = created_at 
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: fr })
    : "";

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 shadow-sm">
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={author?.avatar_url || `https://ui-avatars.com/api/?name=${author?.username || 'User'}`} 
            className="w-10 h-10 rounded-full object-cover border cursor-pointer hover:opacity-80 transition-opacity" 
            alt="avatar"
            onClick={() => navigate(`/user/${author?.id}`)}
          />
          <div>
            <div className="flex items-center gap-1">
              <h4 
                className="font-bold text-gray-900 text-[15px] cursor-pointer hover:underline"
                onClick={() => navigate(`/user/${author?.id}`)}
              >
                {author?.username || "Anonyme"}
              </h4>
              {parent_id && (
                <span className="text-gray-500 text-sm font-normal">• a partagé</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{dateFormatted}</p>
          </div>
        </div>
        
        {user?.id === user_id && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={() => { setIsEditingPost(true); setShowMenu(false); }} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit2 size={16} /> Modifier
                </button>
                <button 
                  onClick={() => { handleDeletePost(); setShowMenu(false); }} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} /> Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONTENU DU POST ACTUEL */}
      <div className="px-4 pb-3">
        {isEditingPost ? (
          <div className="space-y-2">
            <textarea 
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              className="w-full border border-blue-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none min-h-[100px]"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditingPost(false)} className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-md">Annuler</button>
              <button onClick={handleUpdatePost} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">Enregistrer</button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
        )}
      </div>

      {/* --- AFFICHAGE DU POST PARTAGÉ --- */}
      {parent_id && (
        <div className="px-4 pb-4">
          <div className="border rounded-xl bg-gray-50 p-3 hover:bg-gray-100 transition-colors border-gray-200">
            {parent_post ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <img 
                    src={parent_post.author?.avatar_url || `https://ui-avatars.com/api/?name=${parent_post.author?.username}`} 
                    className="w-5 h-5 rounded-full object-cover cursor-pointer" 
                    alt="" 
                    onClick={() => navigate(`/user/${parent_post.author?.id}`)}
                  />
                  <span 
                    className="font-bold text-xs text-gray-900 cursor-pointer hover:underline"
                    onClick={() => navigate(`/user/${parent_post.author?.id}`)}
                  >
                    {parent_post.author?.username}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{parent_post.content}</p>
                {parent_post.image_url && (
                  <img 
                    src={parent_post.image_url} 
                    className="rounded-lg max-h-60 w-full object-cover border border-gray-200" 
                    alt="Original" 
                  />
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500 italic py-2 text-center">Cette publication n'est plus disponible.</p>
            )}
          </div>
        </div>
      )}
      
      {/* IMAGE DU POST (Si présent et pas un partage pour éviter les doublons) */}
      {image_url && !parent_id && (
        <div className="border-y bg-gray-50">
          <img 
            src={image_url} 
            alt="Post" 
            className="w-full max-h-[500px] object-contain mx-auto" 
          />
        </div>
      )}

      {/* STATISTIQUES */}
      <div className="px-4 py-2 flex justify-between text-[13px] text-gray-500 border-b border-gray-50">
        <span>{likes_count > 0 ? `${likes_count} J'aime` : ""}</span>
        <span 
          onClick={() => setShowComments(!showComments)} 
          className="hover:underline cursor-pointer"
        >
          {comments_count > 0 ? `${comments_count} commentaires` : "0 commentaire"}
        </span>
      </div>

      {/* ACTIONS PRINCIPALES */}
      <div className="flex items-center p-1 px-2">
        <button 
          onClick={handleLike} 
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm transition-colors ${
            isLikedByMe ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Heart size={20} className={isLikedByMe ? "fill-current" : ""} /> 
          J'aime
        </button>

        <button 
          onClick={() => setShowComments(!showComments)} 
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-colors"
        >
          <MessageCircle size={20} /> 
          Commenter
        </button>

        <button 
          onClick={() => openShareModal(post)} 
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-colors"
        >
          <Share2 size={20} /> 
          Partager
        </button>
      </div>

      {/* SECTION COMMENTAIRES */}
      {showComments && (
        <div className="px-4 pb-4 border-t pt-3 bg-gray-50/50">
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.username}`} 
              className="w-8 h-8 rounded-full" 
              alt="me" 
            />
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder={replyTo ? `Répondre à ${replyTo.username}...` : "Écrivez un commentaire..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
              {replyTo && (
                <button 
                  type="button"
                  onClick={() => setReplyTo(null)} 
                  className="absolute right-10 top-2 text-xs text-gray-400 hover:text-red-500"
                >
                  Annuler
                </button>
              )}
              <button 
                type="submit" 
                className="absolute right-2 top-1.5 text-blue-600 p-1 hover:bg-blue-50 rounded-full transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex gap-2 group">
                  <img 
                    src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${comment.author?.username}`} 
                    className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80" 
                    alt="author" 
                    onClick={() => navigate(`/user/${comment.author?.id}`)}
                  />
                  <div className="flex-1">
                    <div 
                      className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full relative group"
                      onTouchStart={() => handleTouchStart(comment.id, 'comment')}
                      onTouchEnd={handleTouchEnd}
                    >
                      <p 
                        className="text-xs font-bold text-gray-900 cursor-pointer hover:underline"
                        onClick={() => navigate(`/user/${comment.author?.id}`)}
                      >
                        {comment.author?.username}
                      </p>
                      
                      {editingCommentId === comment.id ? (
                        <div className="mt-1 space-y-1">
                          <input 
                            value={editCommentContent}
                            onChange={(e) => setEditCommentContent(e.target.value)}
                            className="bg-white border rounded px-2 py-1 text-sm w-full outline-none focus:ring-1 focus:ring-blue-400"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateComment(comment.id)}
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateComment(comment.id)} className="text-[10px] text-blue-600 font-bold">Enregistrer</button>
                            <button onClick={() => setEditingCommentId(null)} className="text-[10px] text-gray-400 font-bold">Annuler</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-800">{comment.content}</p>
                      )}
                      
                      {/* Menu 3 points (Desktop/Tablet) et Long Press (Mobile) */}
                      {user?.id === comment.user_id && (
                        <div className="absolute -right-8 top-1">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === `comment-${comment.id}` ? null : `comment-${comment.id}`)}
                            className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                          
                          {activeMenuId === `comment-${comment.id}` && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                              <div className="absolute left-0 mt-1 w-32 bg-white border rounded-lg shadow-xl z-20 py-1 text-xs">
                                <button 
                                  onClick={() => { setEditingCommentId(comment.id); setEditCommentContent(comment.content); setActiveMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700"
                                >
                                  <Edit2 size={12} /> Modifier
                                </button>
                                <button 
                                  onClick={() => { deleteComment(comment.id); setActiveMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"
                                >
                                  <Trash2 size={12} /> Supprimer
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 ml-2 mt-1 text-xs font-bold text-gray-500">
                      <button 
                        onClick={() => setReplyTo({ id: comment.id, username: comment.author?.username })} 
                        className="hover:underline"
                      >
                        Répondre
                      </button>
                      <span>{formatDistanceToNow(new Date(comment.created_at), { locale: fr })}</span>
                    </div>

                    {comment.replies && comment.replies.map(reply => (
                      <div key={reply.id} className="flex gap-2 mt-3 ml-4">
                        <CornerDownRight size={16} className="text-gray-300" />
                        <img 
                          src={reply.author?.avatar_url || `https://ui-avatars.com/api/?name=${reply.author?.username}`} 
                          className="w-6 h-6 rounded-full cursor-pointer hover:opacity-80" 
                          alt="reply-author" 
                          onClick={() => navigate(`/user/${reply.author?.id}`)}
                        />
                        <div className="flex-1">
                          <div 
                            className="bg-white border border-gray-100 rounded-2xl px-3 py-1.5 inline-block group relative"
                            onTouchStart={() => handleTouchStart(reply.id, 'reply')}
                            onTouchEnd={handleTouchEnd}
                          >
                            <p 
                              className="text-[11px] font-bold text-gray-900 cursor-pointer hover:underline"
                              onClick={() => navigate(`/user/${reply.author?.id}`)}
                            >
                              {reply.author?.username}
                            </p>
                            
                            {editingReplyId === reply.id ? (
                              <div className="mt-1 space-y-1">
                                <input 
                                  value={editReplyContent}
                                  onChange={(e) => setEditReplyContent(e.target.value)}
                                  className="bg-white border rounded px-2 py-0.5 text-xs w-full outline-none focus:ring-1 focus:ring-blue-400"
                                  autoFocus
                                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateReply(reply.id)}
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => handleUpdateReply(reply.id)} className="text-[9px] text-blue-600 font-bold">Enregistrer</button>
                                  <button onClick={() => setEditingReplyId(null)} className="text-[9px] text-gray-400 font-bold">Annuler</button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-800">{reply.content}</p>
                            )}

                            {user?.id === reply.user_id && (
                              <div className="absolute -right-7 top-1">
                                <button 
                                  onClick={() => setActiveMenuId(activeMenuId === `reply-${reply.id}` ? null : `reply-${reply.id}`)}
                                  className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal size={12} />
                                </button>
                                
                                {activeMenuId === `reply-${reply.id}` && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                                    <div className="absolute left-0 mt-1 w-28 bg-white border rounded-lg shadow-xl z-20 py-1 text-[10px]">
                                      <button 
                                        onClick={() => { setEditingReplyId(reply.id); setEditReplyContent(reply.content); setActiveMenuId(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                                      >
                                        <Edit2 size={10} /> Modifier
                                      </button>
                                      <button 
                                        onClick={() => { deleteReply(reply.id); setActiveMenuId(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600"
                                      >
                                        <Trash2 size={10} /> Supprimer
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
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

      {isShareModalOpen && (
        <SharePostCard 
          originalPost={post} 
          onClose={closeShareModal} 
        />
      )}
    </div>
  );
};

export default PostCard;