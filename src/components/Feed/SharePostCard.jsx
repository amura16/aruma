import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../../services/supabaseClient';
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

    return await supabase.from('posts').insert(payload);
  };

  const updatePost = async (postId, content) => 
    await supabase.from('posts').update({ content }).eq('id', postId);

  const deletePost = async (postId) => 
    await supabase.from('posts').delete().eq('id', postId);

  const addComment = async (postId, content) => 
    await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content });

  const updateComment = async (commentId, content) => 
    await supabase.from('comments').update({ content }).eq('id', commentId);

  const deleteComment = async (commentId) => 
    await supabase.from('comments').delete().eq('id', commentId);

  const addReply = async (commentId, content) => 
    await supabase.from('comment_replies').insert({ comment_id: commentId, user_id: user.id, content });

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
