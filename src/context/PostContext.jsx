import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // --- 1. CHARGEMENT DES POSTS ---
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_id (id, username, avatar_url),
          likes (user_id),
          comments (
            id, 
            content, 
            created_at, 
            author:user_id (username, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = data.map(post => ({
        ...post,
        isLikedByMe: post.likes?.some(l => String(l.user_id) === String(user?.id)) || false,
        likes_count: post.likes_count ?? 0,
        comments_count: post.comments_count ?? 0,
        comments: post.comments || []
      }));

      setPosts(formatted);
    } catch (err) {
      console.error("Erreur fetchPosts:", err.message);
    } finally {
      setPosts(current => current); // Force refresh UI
      setLoading(false);
    }
  }, [user?.id]);

  // --- 2. REALTIME ---
  useEffect(() => {
    if (!user) return;
    fetchPosts();

    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          fetchPosts(); // On fetch pour récupérer les jointures de l'auteur
        } else if (payload.eventType === 'UPDATE') {
          // IMPORTANT: On ne met à jour que les compteurs venant de la DB
          setPosts(current => current.map(p => 
            p.id === payload.new.id 
              ? { ...p, likes_count: payload.new.likes_count, comments_count: payload.new.comments_count, content: payload.new.content } 
              : p
          ));
        } else if (payload.eventType === 'DELETE') {
          setPosts(current => current.filter(p => p.id !== payload.old.id));
        }
      })
      // On écoute les commentaires pour rafraîchir la liste sous le post
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchPosts(); 
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, fetchPosts]);

  // --- 3. ACTIONS ---

  const toggleLike = async (postId, isLiked) => {
    if (!user) return;

    // Mise à jour optimiste (UI uniquement)
    setPosts(current => current.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLikedByMe: !isLiked,
          likes_count: isLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1
        };
      }
      return p;
    }));

    try {
      if (isLiked) {
        // Suppression explicite
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insertion
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
        
        if (error) throw error;
      }
    } catch (err) {
      console.error("Erreur toggleLike:", err.message);
      fetchPosts(); // Rollback en cas d'erreur
    }
  };

  const createPost = async (content, image_url = null) => {
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content,
      image_url
    });
    if (error) throw error;
  };

  const deletePost = async (postId) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
  };

  const addComment = async (postId, content) => {
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content
    });
    if (error) throw error;
  };

  const updatePost = async (postId, content) => {
    const { error } = await supabase.from('posts').update({ content }).eq('id', postId);
    if (error) throw error;
  };

  return (
    <PostContext.Provider value={{ 
      posts, 
      loading, 
      toggleLike, 
      createPost, 
      deletePost, 
      updatePost, 
      addComment,
      fetchPosts 
    }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostsContext = () => {
  const context = useContext(PostContext);
  if (!context) throw new Error("usePostsContext doit être utilisé dans PostProvider");
  return context;
};