import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { usePostsContext } from '../context/PostContext';
import PostCard from '../components/Feed/PostCard';

const PostDetail = () => {
    const { id } = useParams(); // Récupère l'ID depuis l'URL (toujours un string)
    const navigate = useNavigate();
    const { posts, loading } = usePostsContext();
    const [post, setPost] = useState(null);
    const [isSearching, setIsSearching] = useState(true);

    useEffect(() => {
        // On ne cherche le post que si la liste des posts est chargée
        if (!loading) {
            // CRITIQUE : Conversion en String pour garantir que la comparaison fonctionne 
            // même si l'ID en base est un nombre.
            const foundPost = posts.find(p => String(p.id) === String(id));

            setPost(foundPost);
            setIsSearching(false);
        }
    }, [id, posts, loading]);

    // 1. État de chargement initial (pendant que Supabase répond)
    if (loading || isSearching) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[80vh] text-gray-500">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="animate-pulse">Récupération de la publication...</p>
            </div>
        );
    }

    // 2. État si le post n'existe vraiment pas après le chargement
    if (!post) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Publication introuvable</h2>
                <p className="text-gray-500 mb-6">
                    Il se peut que ce post ait été supprimé ou que le lien soit incorrect.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                >
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    // 3. Affichage du post trouvé
    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Barre de navigation haute */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group"
                >
                    <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">Retour</span>
                </button>

                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Détails de la publication
                </span>
            </div>

            {/* Rendu du post en utilisant la PostCard existante */}
            {/* On utilise l'opérateur spread pour passer toutes les propriétés du post */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PostCard {...post} />
            </div>

            {/* Note : Les commentaires s'afficheront directement dans la PostCard 
          si showComments est activé ou géré par défaut */}
        </div>
    );
};

export default PostDetail;