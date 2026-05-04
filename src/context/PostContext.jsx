import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // --- 1. RÉCUPÉRATION DES POSTS ---
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_id (id, username, avatar_url),
          likes (user_id),
          comments (
            id, user_id, content, created_at,
            author:user_id (username, avatar_url),
            replies:comment_replies (
              id, user_id, content, created_at,
              author:user_id (username, avatar_url)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = data.map(post => ({
        ...post,
        // Conversion en String pour comparer les UUID de manière sûre
        isLikedByMe: post.likes?.some(l => String(l.user_id) === String(user?.id)) || false,
        likes_count: post.likes_count ?? 0,
        comments_count: post.comments_count ?? 0,
        comments: post.comments || []
      }));

      setPosts(formatted);
    } catch (err) {
      console.error("Erreur fetchPosts:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // --- 2. REALTIME ---
  useEffect(() => {
    if (!user) return;
    fetchPosts();

    const channel = supabase.channel('db-all-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setPosts(current => current.map(p => 
            p.id === payload.new.id ? { ...p, ...payload.new } : p
          ));
        } else {
          fetchPosts();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_replies' }, () => fetchPosts())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, fetchPosts]);

  // --- 3. ACTIONS LIKES (CORRIGÉ POUR UUID) ---
  const toggleLike = async (postId, isLiked) => {
    if (!user) return;

    // Mise à jour optimiste UI
    setPosts(current => current.map(p => p.id === postId ? {
      ...p,
      isLikedByMe: !isLiked,
      likes_count: isLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1
    } : p));

    try {
      if (isLiked) {
        // UNLIKE : Suppression basée sur le couple post_id (UUID) et user_id (UUID)
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ 
            post_id: postId, 
            user_id: user.id 
          });

        if (error) throw error;
      } else {
        // LIKE : Insertion
        const { error } = await supabase
          .from('likes')
          .insert({ 
            post_id: postId, 
            user_id: user.id 
          });
        
        if (error) throw error;
      }
    } catch (err) {
      console.error("Erreur toggleLike:", err.message);
      fetchPosts(); // Rollback en cas d'échec
    }
  };

  // --- 4. ACTIONS POSTS ---
  const createPost = async (content, image_url = null) => 
    await supabase.from('posts').insert({ user_id: user.id, content, image_url });

  const updatePost = async (postId, content) => 
    await supabase.from('posts').update({ content }).eq('id', postId);

  const deletePost = async (postId) => 
    await supabase.from('posts').delete().eq('id', postId);

  // --- 5. ACTIONS COMMENTAIRES (CRUD) ---
  const addComment = async (postId, content) => 
    await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content });

  const updateComment = async (commentId, content) => 
    await supabase.from('comments').update({ content }).eq('id', commentId);

  const deleteComment = async (commentId) => 
    await supabase.from('comments').delete().eq('id', commentId);

  // --- 6. ACTIONS RÉPONSES (CRUD) ---
  const addReply = async (commentId, content) => 
    await supabase.from('comment_replies').insert({ comment_id: commentId, user_id: user.id, content });

  const updateReply = async (replyId, content) => 
    await supabase.from('comment_replies').update({ content }).eq('id', replyId);

  const deleteReply = async (replyId) => 
    await supabase.from('comment_replies').delete().eq('id', replyId);

  return (
    <PostContext.Provider value={{ 
      posts, loading, toggleLike, 
      createPost, updatePost, deletePost, 
      addComment, updateComment, deleteComment, 
      addReply, updateReply, deleteReply, 
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

// Alias pour compatibilité
export const usePosts = () => usePostsContext();