import { usePostsContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';

export const usePosts = () => {
  const {
    posts,
    loading,
    error,
    toggleLike,
    addComment,
    updateComment,
    deleteComment,
    addReply,
    updateReply,
    deleteReply,
    // Si tu as ces fonctions dans ton context (non détaillées précédemment mais présentes dans ton hook)
    addPost,
    updatePost,
    deletePost
  } = usePostsContext();

  const { user } = useAuth();

  // --- LOGIQUE POSTS ---
  const createPost = async (content, image_url = null) => {
    if (!user || !addPost) return;
    await addPost(content, image_url, user.id);
  };

  const handleLikePost = async (postId, isLikedByMe) => {
    if (!user) return;
    await toggleLike(postId, isLikedByMe);
  };

  // --- LOGIQUE COMMENTAIRES ---
  const handleAddComment = async (postId, content) => {
    if (!user) return;
    await addComment(postId, content);
  };

  const handleUpdateComment = async (commentId, content) => {
    if (!user) return;
    await updateComment(commentId, content);
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;
    await deleteComment(commentId);
  };

  // --- LOGIQUE RÉPONSES (REPLIES) ---
  const handleAddReply = async (commentId, content) => {
    if (!user) return;
    // Note : On passe uniquement commentId et content, l'user_id est géré dans le context
    await addReply(commentId, content);
  };

  const handleUpdateReply = async (replyId, content) => {
    if (!user) return;
    await updateReply(replyId, content);
  };

  const handleDeleteReply = async (replyId) => {
    if (!user) return;
    await deleteReply(replyId);
  };

  return {
    // États
    posts,
    loading,
    error,

    // Actions Posts
    createPost,
    likePost: handleLikePost,
    updatePost,
    deletePost,

    // Actions Commentaires
    addComment: handleAddComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,

    // Actions Réponses
    addReply: handleAddReply,
    updateReply: handleUpdateReply,
    deleteReply: handleDeleteReply
  };
};