import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_id (id, username, firstname, lastname, avatar_url),
          likes (user_id),
          comments (
            id, content, created_at, 
            author:user_id (id, username, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPosts = data.map(post => ({
        ...post,
        isLikedByMe: post.likes?.some(like => like.user_id === user?.id)
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Erreur fetchPosts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user?.id]);

  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === payload.new.id
              ? { ...post, ...payload.new, author: post.author } // On garde l'author !
              : post
          )
        );
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => fetchPosts())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => fetchPosts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const toggleLike = async (postId, isLiked) => {
    if (!user) return;
    try {
      if (isLiked) {
        await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
        await supabase.rpc('decrement_likes', { row_id: postId });
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
        await supabase.rpc('increment_likes', { row_id: postId });
      }
    } catch (error) { console.error(error); }
  };

  const addComment = async (postId, content) => {
    if (!user) return;
    await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content });
  };

  return (
    <PostContext.Provider value={{ posts, loading, toggleLike, addComment, fetchPosts }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostsContext = () => useContext(PostContext);