import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Edit, Trash2, Bookmark, X, Check } from 'lucide-react';
import Comment from './Comment';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../context/AuthContext';

const PostCard = ({ id, user: author, content, image, time, likes_count: initialLikes, isLikedByMe: initialIsLiked, comments: initialComments }) => {
  const navigate = useNavigate();
  const { likePost, addComment, deletePost, updatePost, toggleSavePost } = usePosts();
  const { user: currentUser } = useAuth();

  // --- ÉTATS LOCAUX ---
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  
  // Normalisation des données de l'auteur pour gérer différents formats d'objets
  const authorId = author?.id || author?.user_id;
  const authorName = author?.name || (author?.firstname ? `${author.firstname} ${author.lastname}` : "Utilisateur ArumA");
  const authorAvatar = author?.avatar || author?.avatar_url;
  const isAuthor = authorId === currentUser?.id;

  // Synchronisation avec les props
  React.useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikesCount(initialLikes);
  }, [initialIsLiked, initialLikes]);

  const comments = initialComments || [];

  // --- LOGIQUE ---
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    likePost(id);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(id, commentText); 
    setCommentText("");
  };

  const handleDelete = () => {
    if (window.confirm("Voulez-vous vraiment supprimer cette publication ?")) {
      deletePost(id);
    }
    setIsMenuOpen(false);
  };

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    updatePost(id, editContent);
    setIsEditing(false);
    setIsMenuOpen(false);
  };

  const handleSave = () => {
    toggleSavePost(id);
    setIsMenuOpen(false);
    alert("Publication enregistrée !");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm relative">
      
      {/* HEADER : Infos Utilisateur */}
      <div className="p-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/profile')}
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-1 ring-gray-100">
            <img 
              src={authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${authorName}`} 
              className="w-full h-full object-cover" 
              alt="avatar" 
            />
          </div>
          <div>
            <h4 className="font-bold text-[14px] group-hover:underline text-gray-900">
              {authorName}
            </h4>
            <p className="text-[12px] text-gray-500 font-medium">{time || "À l'instant"}</p>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <MoreHorizontal size={20} className="text-gray-500" />
          </button>

          {/* MENU DÉROULANT (3 points) */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
              <button 
                onClick={handleSave}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Bookmark size={18} className="text-gray-500" />
                <span className="font-medium">Enregistrer la publication</span>
              </button>
              
              {isAuthor && (
                <>
                  <div className="h-[1px] bg-gray-100 my-1"></div>
                  <button 
                    onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={18} className="text-blue-500" />
                    <span className="font-medium">Modifier la publication</span>
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                    <span className="font-medium">Supprimer</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONTENU : Texte du post ou Mode Édition */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setIsEditing(false); setEditContent(content); }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={16} /> Annuler
              </button>
              <button 
                onClick={handleUpdate}
                className="flex items-center gap-1 px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                <Check size={16} /> Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[#050505] text-[15px] leading-snug whitespace-pre-wrap">
            {content}
          </p>
        )}
      </div>

      {/* MÉDIA : Image optionnelle */}
      {image && !isEditing && (
        <div className="border-y border-gray-100 bg-gray-50">
          <img 
            src={image} 
            alt="Contenu du post" 
            className="w-full h-auto max-h-[512px] object-contain mx-auto" 
          />
        </div>
      )}

      {/* STATS : Likes & Commentaires */}
      <div className="px-4 py-2 flex items-center justify-between text-gray-500 text-sm">
        <div className="flex items-center gap-1.5">
          {likesCount > 0 && (
            <>
              <div className="bg-blue-500 p-1 rounded-full">
                <Heart size={10} className="text-white fill-current" />
              </div>
              <span>{likesCount}</span>
            </>
          )}
        </div>
        <div className="hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>
          {comments.length} commentaires
        </div>
      </div>

      {/* ACTIONS : Like, Comment, Share */}
      <div className="px-4 py-1 border-t border-gray-100 flex items-center justify-between">
        <div className="flex w-full">
          <button 
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-2 font-semibold text-sm rounded-md transition ${
              isLiked ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart size={20} className={isLiked ? "fill-current" : ""} /> 
            <span>{isLiked ? 'Aimé' : 'J\'aime'}</span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 font-semibold text-sm rounded-md transition ${
              showComments ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageCircle size={20} /> 
            <span>Commenter</span>
          </button>

          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-md transition">
            <Share2 size={20} /> 
            <span>Partager</span>
          </button>
        </div>
      </div>

      {/* SECTION COMMENTAIRES DYNAMIQUE */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          
          {/* Liste des commentaires */}
          <div className="space-y-1 mb-4">
            {comments.map((cmt) => (
              <Comment 
                key={cmt.id}
                id={cmt.id}
                user={{ 
                  name: `${cmt.user?.firstname} ${cmt.user?.lastname}`, 
                  avatar: cmt.user?.avatar_url 
                }}
                text={cmt.content}
                time={cmt.created_at}
              />
            ))}
          </div>

          {/* Formulaire de saisie */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <img src={currentUser?.avatar_url} alt="Moi" />
            </div>
            <div className="flex-1 relative">
              <input 
                type="text"
                placeholder="Écrivez un commentaire..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-gray-200 rounded-full py-2 px-4 pr-10 text-[14px] focus:outline-none focus:bg-gray-300 transition"
              />
              <button 
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;