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
      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select("post_id, user_id")
        .in("post_id", postIds);

      if (likesError) {
        console.error("Erreur lors de la récupération des likes (RLS ?) :", likesError.message);
      }

      // 3. Récupérer les commentaires pour ces posts
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select(`
          *,
          user:profiles!user_id (id, username, firstname, lastname, avatar_url)
        `)
        .in("post_id", postIds);

      if (commentsError) {
        console.error("Erreur lors de la récupération des commentaires :", commentsError.message);
      }

      // 4. Assemblage manuel
      const formattedPosts = postsData.map(post => ({
        ...post,
        likes_count: post.likes_count || 0, // Utiliser le compteur de la table posts
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
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      console.error("Erreur : Aucun utilisateur connecté pour liker.");
      return;
    }

    try {
      // STRATÉGIE ATOMIQUE : On tente l'insertion directement
      const { error: insertError } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: targetUserId }]);

      if (insertError) {
        // Code 23505 ou 409 = Le like existe déjà -> ACTION : UNLIKE
        if (insertError.code === '23505' || insertError.status === 409) {
          
          const { error: unlikeError } = await supabase
            .from('likes')
            .delete()
            .match({ post_id: postId, user_id: targetUserId });

          if (unlikeError) throw unlikeError;

          // Décrémentation atomique via RPC (Postgres)
          const { error: rpcError } = await supabase.rpc('decrement_likes', { p_id: postId });
          if (rpcError) console.error("Erreur RPC decrement_likes (Vérifiez le nom du paramètre dans SQL) :", rpcError.message);

          // Mise à jour locale
          setPosts(prev => prev.map(p => 
            Number(p.id) === Number(postId) 
              ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) - 1), isLikedByMe: false } 
              : p
          ));
          
        } else {
          throw insertError;
        }
      } else {
        // --- ACTION : LIKE RÉUSSI ---
        // Incrémentation atomique via RPC (Postgres)
        const { error: rpcError } = await supabase.rpc('increment_likes', { p_id: postId });
        if (rpcError) console.error("Erreur RPC increment_likes (Vérifiez le nom du paramètre dans SQL) :", rpcError.message);

        // Mise à jour locale
        setPosts(prev => prev.map(p => 
          Number(p.id) === Number(postId) 
            ? { ...p, likes_count: (p.likes_count || 0) + 1, isLikedByMe: true } 
            : p
        ));
      }
    } catch (err) {
      console.error("Erreur globale lors du like/unlike :", err.message);
    }
  };

  const updatePost = async (postId, content) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.map(p => 
        Number(p.id) === Number(postId) ? { ...p, content } : p
      ));
    } catch (err) {
      console.error("Erreur modification post:", err.message);
    }
  };

  const deletePost = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => Number(p.id) !== Number(postId)));
    } catch (err) {
      console.error("Erreur suppression post:", err.message);
    }
  };

  const toggleSavePost = async (postId) => {
    try {
      if (!user) return;
      
      const { data: existing } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('saved_posts').delete().eq('id', existing.id);
      } else {
        await supabase.from('saved_posts').insert([{ post_id: postId, user_id: user.id }]);
      }
    } catch (err) {
      console.error("Erreur enregistrement post:", err.message);
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
        if (Number(post.id) === Number(postId)) {
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
    <PostContext.Provider value={{ 
      posts, 
      loading, 
      error, 
      addPost, 
      likePost, 
      addComment, 
      likeComment,
      updatePost,
      deletePost,
      toggleSavePost
    }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostsContext = () => useContext(PostContext);
