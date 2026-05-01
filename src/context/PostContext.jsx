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
          parent_post:parent_id (
            id, content, image_url, created_at,
            author:user_id (id, username, avatar_url, firstname, lastname)
          ),
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
        // Calcul du total : commentaires + toutes les réponses associées
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

    // Inscription aux changements de la base de données
    const channel = supabase
      .channel('db-global-realtime')
      // Écoute les posts (création, modif, suppression)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      // Écoute les likes
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => fetchPosts())
      // Écoute les commentaires
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchPosts())
      // Écoute les réponses aux commentaires
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_replies' }, () => fetchPosts())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // --- 3. ACTIONS SUR LES POSTS ---
  const createPost = async (postData) => {
    if (!user) return;
    const hasContent = postData.content?.trim() || postData.image_url || postData.parent_id;
    if (!hasContent) return;

    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: postData.content || null,
        image_url: postData.image_url || null,
        parent_id: postData.parent_id || null
      });
      if (error) throw error;
    } catch (error) {
      console.error("Erreur createPost:", error.message);
      throw error;
    }
  };

  const updatePost = async (postId, content) => {
    try {
      const { error } = await supabase.from('posts').update({ content }).eq('id', postId);
      if (error) throw error;
    } catch (error) {
      console.error("Erreur updatePost:", error.message);
    }
  };

  const deletePost = async (postId) => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
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
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        content
      });
      if (error) throw error;
    } catch (error) {
      console.error("Erreur addComment:", error.message);
    }
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
    try {
      const { error } = await supabase.from('comment_replies').insert({
        comment_id: commentId,
        user_id: user.id,
        content
      });
      if (error) throw error;
    } catch (error) {
      console.error("Erreur addReply:", error.message);
    }
  };

  const updateReply = async (replyId, content) => {
    await supabase.from('comment_replies').update({ content }).eq('id', replyId);
  };

  const deleteReply = async (replyId) => {
    await supabase.from('comment_replies').delete().eq('id', replyId);
  };

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

export const usePostsContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePostsContext doit être utilisé à l'intérieur d'un PostProvider");
  }
  return context;
};