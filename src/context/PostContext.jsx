import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // --- 1. CHARGEMENT DES POSTS ---
  // On récupère likes_count et comments_count (gérés par SQL)
  // On joint 'likes' pour savoir si l'utilisateur actuel a liké
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_id (id, username, avatar_url),
          likes (user_id),
          parent_post:parent_id (
            id, content, image_url, 
            author:user_id (username)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = data.map(post => ({
        ...post,
        // Détermine l'état initial du bouton J'aime
        isLikedByMe: post.likes?.some(l => String(l.user_id) === String(user?.id)) || false,
        likes_count: post.likes_count ?? 0,
        comments_count: post.comments_count ?? 0
      }));

      setPosts(formatted);
    } catch (err) {
      console.error("Erreur fetchPosts:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // --- 2. REALTIME (ABONNEMENT UNIQUE) ---
  useEffect(() => {
    if (!user) return;
    fetchPosts();

    // On écoute les changements sur 'posts' pour les compteurs et 'likes' pour l'état du bouton
    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          fetchPosts(); // Nouveau post : on recharge pour avoir les jointures
        } else if (payload.eventType === 'UPDATE') {
          // Mise à jour ciblée : évite le re-render total
          setPosts(current => current.map(p => 
            p.id === payload.new.id ? { ...p, ...payload.new } : p
          ));
        } else if (payload.eventType === 'DELETE') {
          setPosts(current => current.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => {
        // Un like/unlike a eu lieu : on rafraîchit pour recalculer isLikedByMe
        fetchPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_replies' }, () => fetchPosts())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, fetchPosts]);

  // --- 3. ACTIONS ---

  // Logique de Like Optimiste
  const toggleLike = async (postId, isLiked) => {
    if (!user) return;

    // Mise à jour immédiate de l'UI (Optimistic Update)
    setPosts(current => current.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLikedByMe: !isLiked,
          likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1
        };
      }
      return p;
    }));

    try {
      if (isLiked) {
        await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
      console.error("Erreur toggleLike:", err);
      fetchPosts(); // Rollback en cas d'échec
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

  const updatePost = async (postId, content) => {
    const { error } = await supabase.from('posts').update({ content }).eq('id', postId);
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