import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // --- 1. CHARGEMENT DES POSTS (Modifié pour inclure le post parent) ---
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_id (id, username, avatar_url),
          parent_post:parent_id (
            id, content, image_url, created_at,
            author:user_id (username, avatar_url)
          ),
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

  // --- 2. REALTIME (STRICTEMENT CONSERVÉ) ---
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

  // --- 3. ACTIONS LIKES (STRICTEMENT CONSERVÉ) ---
  const toggleLike = async (postId, isLiked) => {
    if (!user) return;

    const currentUserId = user.id;
    const currentPostId = postId;

    setPosts(current => current.map(p => p.id === currentPostId ? {
      ...p,
      isLikedByMe: !isLiked,
      likes_count: isLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1
    } : p));

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ post_id: currentPostId, user_id: currentUserId });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: currentPostId, user_id: currentUserId });
        
        if (error && error.code !== '23505') throw error;

        // --- Notification pour le Like ---
        // On récupère d'abord le propriétaire du post
        const { data: postData } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', currentPostId)
          .single();

        if (postData && postData.user_id !== currentUserId) {
          await supabase.from('notifications').insert({
            user_id: postData.user_id,
            actor_id: currentUserId,
            post_id: currentPostId,
            type: 'like',
            content: 'a aimé votre publication'
          });
        }
      }
    } catch (err) {
      console.error("Erreur toggleLike:", err);
      fetchPosts(); 
    }
  };

  // --- 4. AUTRES ACTIONS (createPost adapté pour le partage) ---
  const createPost = async (postData) => {
    // Gère soit un string (ancien usage), soit un objet (nouveau usage pour le partage)
    const payload = typeof postData === 'string' 
      ? { user_id: user.id, content: postData }
      : { user_id: user.id, ...postData };

    const { data, error } = await supabase.from('posts').insert(payload).select().single();
    
    // --- Notification pour le Partage ---
    if (!error && payload.parent_id && data) {
      const { data: parentPost } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', payload.parent_id)
        .single();

      if (parentPost && parentPost.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: parentPost.user_id,
          actor_id: user.id,
          post_id: data.id, // On pointe vers le post de partage
          type: 'share',
          content: 'a partagé votre publication'
        });
      }
    }
    return { data, error };
  };

  const updatePost = async (postId, content) => 
    await supabase.from('posts').update({ content }).eq('id', postId);

  const deletePost = async (postId) => 
    await supabase.from('posts').delete().eq('id', postId);

  const addComment = async (postId, content) => {
    const { data, error } = await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content }).select().single();
    
    if (!error && data) {
      const { data: postData } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (postData && postData.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: postData.user_id,
          actor_id: user.id,
          post_id: postId,
          type: 'comment',
          content: 'a commenté votre publication'
        });
      }
    }
    return { data, error };
  };

  const updateComment = async (commentId, content) => 
    await supabase.from('comments').update({ content }).eq('id', commentId);

  const deleteComment = async (commentId) => 
    await supabase.from('comments').delete().eq('id', commentId);

  const addReply = async (commentId, content) => {
    const { data, error } = await supabase.from('comment_replies').insert({ comment_id: commentId, user_id: user.id, content }).select().single();
    
    if (!error && data) {
      const { data: commentData } = await supabase
        .from('comments')
        .select('user_id, post_id')
        .eq('id', commentId)
        .single();

      if (commentData && commentData.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: commentData.user_id,
          actor_id: user.id,
          post_id: commentData.post_id,
          type: 'comment', // ou 'reply' si vous voulez distinguer
          content: 'a répondu à votre commentaire'
        });
      }
    }
    return { data, error };
  };

  const updateReply = async (replyId, content) => 
    await supabase.from('comment_replies').update({ content }).eq('id', replyId);

  const deleteReply = async (replyId) => 
    await supabase.from('comment_replies').delete().eq('id', replyId);

  return (
    <PostContext.Provider value={{ 
      posts, loading, toggleLike, createPost, updatePost, deletePost, 
      addComment, updateComment, deleteComment, 
      addReply, updateReply, deleteReply, fetchPosts 
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

export const usePosts = () => usePostsContext();