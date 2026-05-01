import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePostsContext } from '../../context/PostContext';
import { formatTime } from '../../utils/formatTime';

const SharePostCard = ({ originalPost, onClose }) => {
    const { user: currentUser } = useAuth();
    const { createPost } = usePostsContext();

    const [shareContent, setShareContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // --- LOGIQUE DE SOUMISSION ---
    const handleShareSubmit = async (e) => {
        e.preventDefault();

        // On lance le partage même si shareContent est vide (comportement Facebook)
        setIsLoading(true);
        try {
            await createPost({
                content: shareContent.trim() || null, // Autorise le contenu nul
                parent_id: originalPost.id,           // Lie au post d'origine
            });
            onClose();
        } catch (error) {
            console.error("Erreur lors du partage :", error);
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">

            {/* OVERLAY FLOU */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* MODAL DE PARTAGE */}
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username}`}
                            className="w-10 h-10 rounded-full object-cover border shadow-sm"
                            alt="Mon profil"
                        />
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Partager la publication</h3>
                            <p className="text-xs text-blue-600 font-medium">
                                Public • Sur votre profil
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-4 overflow-y-auto custom-scrollbar">
                    {/* ZONE DE TEXTE (Optionnelle) */}
                    <textarea
                        className="w-full border-none focus:ring-0 text-lg placeholder-gray-400 min-h-[80px] resize-none mb-4"
                        placeholder="Dites-en plus sur ce partage... (optionnel)"
                        value={shareContent}
                        onChange={(e) => setShareContent(e.target.value)}
                        autoFocus
                    />

                    {/* APERÇU DU POST ORIGINAL (Encapsulé) */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 select-none pointer-events-none">
                        <div className="p-3 flex items-center gap-2 border-b border-gray-100 bg-white/80">
                            <img
                                src={originalPost.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${originalPost.author?.username}`}
                                className="w-6 h-6 rounded-full"
                                alt=""
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-[12px] text-gray-800 leading-none">
                                    {originalPost.author?.username}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {formatTime(originalPost.created_at)}
                                </span>
                            </div>
                        </div>

                        <div className="p-3 bg-white/50">
                            <p className="text-sm text-gray-700 line-clamp-3 leading-snug">
                                {originalPost.content}
                            </p>
                        </div>

                        {originalPost.image_url && (
                            <div className="bg-gray-100 flex justify-center border-t border-gray-100">
                                <img
                                    src={originalPost.image_url}
                                    className="max-h-48 w-full object-contain"
                                    alt="Aperçu média"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 bg-gray-50 border-t flex justify-end items-center gap-4">
                    <button
                        onClick={onClose}
                        className="text-gray-500 font-medium text-sm hover:underline"
                    >
                        Annuler
                    </button>

                    <button
                        onClick={handleShareSubmit}
                        disabled={isLoading}
                        className={`
              flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
              text-white px-8 py-2.5 rounded-full font-bold transition-all shadow-lg
              ${isLoading ? 'opacity-70 cursor-not-allowed shadow-none' : 'shadow-blue-200'}
            `}
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send size={18} />
                        )}
                        {isLoading ? 'Publication...' : 'Partager'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SharePostCard;