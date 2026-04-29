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

  const addPost = async (content, image_url, user_id) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{ content, image_url, user_id }])
        .select(`
          *,
          author:user_id (id, username, firstname, lastname, avatar_url)
        `)
        .single();

      if (error) throw error;
      setPosts(prev => [data, ...prev]);
    } catch (err) {
      console.error("Erreur lors de la création du post:", err.message);
    }
  };

  const likePost = async (postId, userId) => {
    try {
      // Vérifier si déjà liké
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase.from('likes').delete().eq('id', existingLike.id);
      } else {
        // Like
        await supabase.from('likes').insert([{ post_id: postId, user_id: userId }]);
      }
      
      // Note: On pourrait aussi mettre à jour posts localement ou via realtime
    } catch (err) {
      console.error("Erreur lors du like:", err.message);
    }
  };

  const addComment = async (postId, userId, content) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ post_id: postId, user_id: userId, content }])
        .select(`
          *,
          user:user_id (id, username, firstname, lastname, avatar_url)
        `)
        .single();

      if (error) throw error;
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post, comments: [...(post.comments || []), data] };
        }
        return post;
      }));
    } catch (err) {
      console.error("Erreur lors du commentaire:", err.message);
    }
  };

  return (
    <PostContext.Provider value={{ posts, loading, error, addPost, likePost, addComment }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostsContext = () => useContext(PostContext);
