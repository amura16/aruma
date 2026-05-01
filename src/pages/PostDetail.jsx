import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePostsContext } from '../context/PostContext';
import PostCard from '../components/Feed/PostCard';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { posts, loading } = usePostsContext();
    const [post, setPost] = useState(null);
    const [isSearching, setIsSearching] = useState(true);

    useEffect(() => {
        // On attend que le chargement global soit terminé
        if (!loading) {
            // Conversion en String pour garantir la comparaison
            const foundPost = posts.find(p => String(p.id) === String(id));
            setPost(foundPost);
            setIsSearching(false);
        }
    }, [id, posts, loading]);

    // Si le contexte est encore en train de charger les données depuis Supabase
    if (loading || isSearching) return (
        <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 animate-pulse">Chargement de la publication...</p>
        </div>
    );

    // Si on a fini de chercher et que rien n'a été trouvé
    if (!post) return (
        <div className="text-center pt-20 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md mx-auto border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Contenu introuvable</h2>
                <p className="text-gray-500 mb-6">
                    Ce post n'existe plus ou a été supprimé par son auteur.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition-colors"
                >
                    Retour au fil d'actualité
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F0F2F5] pt-4 pb-12 px-4">
            <div className="max-w-[680px] mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-4 p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                >
                    <ArrowLeft size={20} />
                    <span className="font-bold text-sm">Retour</span>
                </button>

                {/* On passe toutes les props du post trouvé */}
                <PostCard
                    key={post.id}
                    id={post.id}
                    author={post.author}
                    content={post.content}
                    image_url={post.image_url}
                    created_at={post.created_at}
                    likes_count={post.likes_count}
                    isLikedByMe={post.isLikedByMe}
                    comments={post.comments}
                    total_comments_count={post.total_comments_count}
                    parent_post={post.parent_post}
                />
            </div>
        </div>
    );
};

export default PostDetail;