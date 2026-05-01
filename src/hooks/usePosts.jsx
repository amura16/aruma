import { usePostsContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';

export const usePosts = () => {
  const {
    posts,
    loading,
    error,
    createPost, // Utilisation directe du nom défini dans le contexte
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    updateComment,
    deleteComment,
    addReply,
    updateReply,
    deleteReply
  } = usePostsContext();

  const { user } = useAuth();

  // --- LOGIQUE POSTS ---
  const handleCreatePost = async (content, image_url = null) => {
    if (!user) return;
    try {
      // On passe un objet structuré comme attendu par le contexte
      await createPost({ content, image_url });
    } catch (err) {
      console.error("Erreur hook createPost:", err);
    }
  };

  const handleLikePost = async (postId, isLikedByMe) => {
    if (!user) return;
    await toggleLike(postId, isLikedByMe);
  };

  // --- LOGIQUE COMMENTAIRES ---
  const handleAddComment = async (postId, content) => {
    if (!user || !content.trim()) return;
    await addComment(postId, content);
  };

  const handleUpdateComment = async (commentId, content) => {
    if (!user || !content.trim()) return;
    await updateComment(commentId, content);
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;
    if (window.confirm("Supprimer ce commentaire ?")) {
      await deleteComment(commentId);
    }
  };

  // --- LOGIQUE RÉPONSES (REPLIES) ---
  const handleAddReply = async (commentId, content) => {
    if (!user || !content.trim()) return;
    // Le temps réel est assuré par l'abonnement dans PostContext
    await addReply(commentId, content);
  };

  const handleUpdateReply = async (replyId, content) => {
    if (!user || !content.trim()) return;
    await updateReply(replyId, content);
  };

  const handleDeleteReply = async (replyId) => {
    if (!user) return;
    // Pas besoin de confirm ici si tu l'as déjà mis dans le composant UI
    await deleteReply(replyId);
  };

  return {
    // États
    posts,
    loading,
    error,

    // Actions sur les Posts
    createPost: handleCreatePost,
    likePost: handleLikePost,
    updatePost,
    deletePost,

    // Actions sur les Commentaires
    addComment: handleAddComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,

    // Actions sur les Réponses (Real-time)
    addReply: handleAddReply,
    updateReply: handleUpdateReply,
    deleteReply: handleDeleteReply
  };
};