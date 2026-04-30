import { usePostsContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';

export const usePosts = () => {
  const { 
    posts, 
    loading, 
    error, 
    addPost, 
    likePost, 
    addComment,
    addReply,
    likeComment,
    updatePost,
    deletePost,
    toggleSavePost
  } = usePostsContext();
  const { user } = useAuth();

  const createPost = async (content, image = null) => {
    if (!user) return;
    await addPost(content, image, user.id);
  };

  const handleLike = async (postId) => {
    if (!user) return;
    await likePost(postId, user.id);
  };

  const handleComment = async (postId, content) => {
    if (!user) return;
    await addComment(postId, user.id, content);
  };

  const handleReply = async (postId, commentId, content) => {
    if (!user) return;
    await addReply(postId, commentId, user.id, content);
  };

  const handleLikeComment = async (commentId) => {
    if (!user) return;
    await likeComment(commentId, user.id);
  };

  return {
    posts,
    loading,
    error,
    createPost,
    likePost: handleLike,
    addComment: handleComment,
    addReply: handleReply,
    likeComment: handleLikeComment,
    updatePost,
    deletePost,
    toggleSavePost
  };
};
