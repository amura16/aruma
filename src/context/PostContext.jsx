import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // --- 1. RÉCUPÉRATION DES DONNÉES (FETCH) ---
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
            id, content, created_at, user_id,
            author:user_id (id, username, avatar_url, firstname, lastname),
            replies:comment_replies (
              id, content, created_at, user_id, comment_id,
              author:user_id (id, username, avatar_url, firstname, lastname)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPosts = data.map(post => {
        const parentComments = post.comments || [];
        const totalCommentsCount = parentComments.reduce((acc, comment) => {
          const repliesCount = comment.replies?.length || 0;
          return acc + 1 + repliesCount;
        }, 0);

        return {
          ...post,
          isLikedByMe: post.likes?.some(like => like.user_id === user?.id),
          likes_count: post.likes_count || 0,
          total_comments_count: totalCommentsCount,
          comments: parentComments
        };
      });

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Erreur fetchPosts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. GESTION DU TEMPS RÉEL (REALTIME) ---
  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('db-global-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_replies' }, () => fetchPosts())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // --- 3. ACTIONS SUR LES POSTS ---
  const createPost = async (content, mediaUrl = null) => {
    if (!user || (!content.trim() && !mediaUrl)) return;
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content,
          image_url: mediaUrl,
        });
      if (error) throw error;
    } catch (error) {
      console.error("Erreur createPost:", error.message);
      throw error;
    }
  };

  const updatePost = async (postId, content) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', postId);
      if (error) throw error;
    } catch (error) {
      console.error("Erreur updatePost:", error.message);
    }
  };

  const deletePost = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
    } catch (error) {
      console.error("Erreur deletePost:", error.message);
    }
  };

  // --- 4. ACTIONS SUR LES LIKES ---
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
    } catch (error) {
      console.error("Erreur toggleLike:", error);
    }
  };

  // --- 5. ACTIONS SUR LES COMMENTAIRES ---
  const addComment = async (postId, content) => {
    if (!user || !content.trim()) return;
    await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content });
  };

  const updateComment = async (commentId, content) => {
    await supabase.from('comments').update({ content }).eq('id', commentId);
  };

  const deleteComment = async (commentId) => {
    await supabase.from('comments').delete().eq('id', commentId);
  };

  // --- 6. ACTIONS SUR LES RÉPONSES (REPLIES) ---
  const addReply = async (commentId, content) => {
    if (!user || !content.trim()) return;
    await supabase.from('comment_replies').insert({ comment_id: commentId, user_id: user.id, content });
  };

  const updateReply = async (replyId, content) => {
    await supabase.from('comment_replies').update({ content }).eq('id', replyId);
  };

  const deleteReply = async (replyId) => {
    await supabase.from('comment_replies').delete().eq('id', replyId);
  };

  // --- LE RETURN DU PROVIDER (C'est ici qu'il doit se trouver) ---
  return (
    <PostContext.Provider value={{
      posts,
      loading,
      fetchPosts,
      createPost,
      updatePost,
      deletePost,
      toggleLike,
      addComment,
      updateComment,
      deleteComment,
      addReply,
      updateReply,
      deleteReply
    }}>
      {children}
    </PostContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const usePostsContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePostsContext doit être utilisé à l'intérieur d'un PostProvider");
  }
  return context;
};