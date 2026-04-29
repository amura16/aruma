import { usePostsContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';

export const usePosts = () => {
  const { posts, loading, error, addPost, likePost, addComment } = usePostsContext();
  const { user } = useAuth();

  const createPost = (content, image = null) => {
    const newPost = {
      id: Date.now(),
      content,
      image_url: image,
      created_at: new Date().toISOString(),
      author: {
        id: user.id,
        username: user.username,
        firstname: user.name.split(' ')[0],
        lastname: user.name.split(' ')[1] || '',
        avatar_url: user.avatar_url
      },
      likes_count: 0,
      isLikedByMe: false,
      comments: []
    };
    addPost(newPost);
  };

  return {
    posts,
    loading,
    error,
    createPost,
    likePost,
    addComment
  };
};
