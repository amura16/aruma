import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import Reply from './Reply';

const Comment = ({ user, text, time }) => {
  const navigate = useNavigate();
  
  // --- ÉTATS ---
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  
  // État initial avec un exemple de réponse
  const [replies, setReplies] = useState([
    {
      id: 101,
      user: { name: "Sonia Rakoto", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia" },
      text: "Je suis totalement d'accord avec toi ! 😊",
      time: "45m"
    }
  ]);

  // --- ACTIONS ---
  const handleReplyAction = (targetName = null) => {
    setShowReplyInput(true);
    if (targetName) {
      setReplyText(`@${targetName} `);
    }
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      user: { name: "Felix Dev" }, // Utilisateur actuel simulé
      text: replyText,
      time: "À l'instant"
    };

    setReplies([...replies, newReply]);
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div className="mb-4">
      {/* --- BLOC COMMENTAIRE PARENT --- */}
      <div className="flex gap-2">
        <div 
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition"
        >
          <img 
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
            alt="avatar" 
            className="w-full h-full object-cover" 
          />
        </div>

        <div className="flex flex-col max-w-[85%]">
          <div className="bg-gray-100 px-3 py-2 rounded-2xl relative">
            <h5 
              onClick={() => navigate('/profile')} 
              className="text-[13px] font-bold hover:underline cursor-pointer text-gray-900"
            >
              {user?.name || "Utilisateur"}
            </h5>
            <p className="text-[14px] text-gray-900 leading-snug break-words">
              {text}
            </p>

            {/* Badge Like si activé */}
            {isLiked && (
              <div className="absolute -right-2 -bottom-1 bg-white shadow-sm border border-gray-100 rounded-full p-0.5">
                <div className="bg-blue-500 rounded-full p-0.5 text-[8px] text-white">👍</div>
              </div>
            )}
          </div>

          {/* Actions du commentaire parent */}
          <div className="flex gap-4 ml-2 mt-0.5 items-center">
            <button 
              onClick={() => setIsLiked(!isLiked)} 
              className={`text-[12px] font-bold hover:underline transition-colors ${isLiked ? 'text-blue-600' : 'text-gray-500'}`}
            >
              {isLiked ? "Aimé" : "J'aime"}
            </button>
            <button 
              onClick={() => handleReplyAction()} 
              className="text-[12px] font-bold text-gray-500 hover:underline"
            >
              Répondre
            </button>
            <span className="text-[12px] text-gray-400 font-normal">{time}</span>
          </div>
        </div>
      </div>

      {/* --- LISTE DES RÉPONSES --- */}
      <div className="space-y-1">
        {replies.map(reply => (
          <Reply 
            key={reply.id} 
            {...reply} 
            onReply={(name) => handleReplyAction(name)} 
          />
        ))}
      </div>

      {/* --- FORMULAIRE DE RÉPONSE --- */}
      {showReplyInput && (
        <form onSubmit={handleReplySubmit} className="flex items-center gap-2 mt-2 ml-10 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Moi" />
          </div>
          <div className="flex-1 relative">
            <input 
              autoFocus
              type="text"
              placeholder="Écrire une réponse..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-gray-100 rounded-full py-1.5 px-3 pr-8 text-[12px] focus:outline-none focus:bg-gray-200 border border-transparent focus:border-gray-300 transition-all"
            />
            <button 
              type="submit" 
              disabled={!replyText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:text-gray-300 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Comment;