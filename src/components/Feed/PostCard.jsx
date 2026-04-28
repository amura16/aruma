import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import Comment from './Comment';

const PostCard = ({ user, content, image, time }) => {
  const navigate = useNavigate();

  // --- ÉTATS INTERACTIFS ---
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 50));
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  // Simulation d'une liste de commentaires
  const [comments, setComments] = useState([
    { id: 1, user: { name: "Lucas Bernard" }, text: "Incroyable cette vue ! 😍", time: "2h" },
    { id: 2, user: { name: "Marie Rakoto" }, text: "ArumA avance super vite, bravo !", time: "1h" }
  ]);

  // --- LOGIQUE ---
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      user: { name: "Felix Dev" }, // Utilisateur actuel simulé
      text: commentText,
      time: "À l'instant"
    };

    setComments([...comments, newComment]);
    setCommentText("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">
      
      {/* HEADER : Infos Utilisateur */}
      <div className="p-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/profile')}
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-1 ring-gray-100">
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
              className="w-full h-full object-cover" 
              alt="avatar" 
            />
          </div>
          <div>
            <h4 className="font-bold text-[14px] group-hover:underline text-gray-900">
              {user?.name || "Utilisateur ArumA"}
            </h4>
            <p className="text-[12px] text-gray-500 font-medium">{time || "À l'instant"}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>
      </div>

      {/* CONTENU : Texte du post */}
      <div className="px-4 pb-3">
        <p className="text-[#050505] text-[15px] leading-snug whitespace-pre-wrap">
          {content}
        </p>
      </div>

      {/* MÉDIA : Image optionnelle */}
      {image && (
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
                user={cmt.user}
                text={cmt.text}
                time={cmt.time}
              />
            ))}
          </div>

          {/* Formulaire de saisie */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Moi" />
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