import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial posts from Supabase (as requested)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("posts")
          .select(`
            *,
            author:user_id (
              id,
              username,
              firstname,
              lastname,
              avatar_url
            )
          `)
          .order("created_at", { ascending: false });

        if (supabaseError) throw supabaseError;
        setPosts(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const addPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const likePost = (postId) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = post.isLikedByMe; // Simulated
        return {
          ...post,
          likes_count: (post.likes_count || 0) + (isLiked ? -1 : 1),
          isLikedByMe: !isLiked
        };
      }
      return post;
    }));
  };

  const addComment = (postId, comment) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), comment]
        };
      }
      return post;
    }));
  };

  return (
    <PostContext.Provider value={{ posts, loading, error, addPost, likePost, addComment }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostsContext = () => useContext(PostContext);
