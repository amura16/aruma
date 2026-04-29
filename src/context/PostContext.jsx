import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      // 1. Récupérer les posts et les auteurs
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!user_id (id, username, firstname, lastname, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      if (!postsData) return setPosts([]);

      const postIds = postsData.map(p => p.id);

      // 2. Récupérer les likes pour ces posts
      const { data: likesData } = await supabase
        .from("likes")
        .select("post_id, user_id")
        .in("post_id", postIds);

      // 3. Récupérer les commentaires pour ces posts
      const { data: commentsData } = await supabase
        .from("comments")
        .select(`
          *,
          user:profiles!user_id (id, username, firstname, lastname, avatar_url)
        `)
        .in("post_id", postIds);

      // 4. Assemblage manuel
      const formattedPosts = postsData.map(post => ({
        ...post,
        likes_count: likesData?.filter(l => l.post_id === post.id).length || 0,
        isLikedByMe: likesData?.some(l => l.post_id === post.id && l.user_id === user?.id) || false,
        comments: commentsData?.filter(c => c.post_id === post.id) || []
      }));

      setPosts(formattedPosts);
    } catch (err) {
      console.error("Erreur fetchPosts:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user?.id]);

  const addPost = async (content, image_url, user_id) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{ content, image_url, user_id }])
        .select(`
          *,
          author:profiles!user_id (id, username, firstname, lastname, avatar_url)
        `)
        .single();

      if (error) throw error;
      setPosts(prev => [{ ...data, likes_count: 0, isLikedByMe: false, comments: [] }, ...prev]);
    } catch (err) {
      console.error("Erreur création post:", err.message);
    }
  };

  const likePost = async (postId, userId) => {
    try {
      // 1. Vérifier si déjà liké
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase.from('likes').delete().eq('id', existingLike.id);

        // MÀJ locale
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, likes_count: p.likes_count - 1, isLikedByMe: false } : p
        ));
      } else {
        // Like
        await supabase.from('likes').insert([{ post_id: postId, user_id: userId }]);

        // MÀJ locale
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, likes_count: p.likes_count + 1, isLikedByMe: true } : p
        ));
      }
    } catch (err) {
      console.error("Erreur like:", err.message);
    }
  };

  const addComment = async (postId, userId, content) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ post_id: postId, user_id: userId, content }])
        .select(`
          *,
          user:profiles!user_id (id, username, firstname, lastname, avatar_url)
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
      console.error("Erreur commentaire:", err.message);
    }
  };

  const likeComment = async (commentId, userId) => {
    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        await supabase.from('likes').delete().eq('id', existingLike.id);
      } else {
        await supabase.from('likes').insert([{ comment_id: commentId, user_id: userId }]);
      }
    } catch (err) {
      console.error("Erreur like commentaire:", err.message);
    }
  };

  return (
    <PostContext.Provider value={{ posts, loading, error, addPost, likePost, addComment, likeComment }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostsContext = () => useContext(PostContext);
