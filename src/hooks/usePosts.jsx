import { usePostsContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';

export const usePosts = () => {
  const {
    posts,
    loading,
    error,
    addPost,
    toggleLike, // Changé pour correspondre à la logique de bascule
    addComment,
    addReply,
    likeComment,
    updatePost,
    deletePost,
    toggleSavePost
  } = usePostsContext();

  const { user } = useAuth();

  // Créer un nouveau post
  const createPost = async (content, image_url = null) => {
    if (!user) return;
    await addPost(content, image_url, user.id);
  };

  // Gérer le like (sans mise à jour locale, attend le Realtime)
  const handleLike = async (postId, isLikedByMe) => {
    if (!user) return;
    // On passe l'état actuel pour savoir s'il faut insérer ou supprimer
    await toggleLike(postId, isLikedByMe);
  };

  // Gérer l'ajout de commentaire
  const handleComment = async (postId, content) => {
    if (!user) return;
    await addComment(postId, content);
  };

  // Gérer l'ajout de réponse
  const handleReply = async (postId, commentId, content) => {
    if (!user) return;
    await addReply(postId, commentId, user.id, content);
  };

  // Gérer le like sur un commentaire
  const handleLikeComment = async (commentId) => {
    if (!user) return;
    await likeComment(commentId, user.id);
  };

  return {
    posts,
    loading,
    error,
    createPost,
    likePost: handleLike, // Utilisé par PostCard
    addComment: handleComment,
    addReply: handleReply,
    likeComment: handleLikeComment,
    updatePost,
    deletePost,
    toggleSavePost
  };
};