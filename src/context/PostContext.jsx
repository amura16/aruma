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

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!user_id (id, username, firstname, lastname, avatar_url),
          likes (user_id),
          comments (
            *,
            user:profiles!user_id (id, username, firstname, lastname, avatar_url)
          )
        `)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      if (!postsData) return setPosts([]);

      const formattedPosts = postsData.map(post => ({
        ...post,
        likes_count: post.likes_count || 0,
        isLikedByMe: post.likes?.some(l => l.user_id === user?.id) || false,
        comments: post.comments || []
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
      // 1. Vérifier si l'utilisateur a déjà liké ce post
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (checkError) throw checkError;

      // 2. Récupérer le compteur actuel du post
      const { data: currentPost, error: postFetchError } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
        
      if (postFetchError) throw postFetchError;
      
      const currentCount = currentPost.likes_count || 0;

      if (existingLike) {
        // 3a. S'il a déjà liké -> UNLIKE
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', targetUserId);
          
        if (deleteError) throw deleteError;

        // Mettre à jour le compteur manuellement (-1)
        const newCount = Math.max(0, currentCount - 1);
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: newCount })
          .eq('id', postId);
          
        if (updateError) console.error("Erreur mise à jour compteur:", updateError.message);

      } else {
        // 3b. S'il n'a pas encore liké -> LIKE
        const { error: insertError } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: targetUserId }]);
          
        if (insertError) {
          // Si on obtient une erreur de duplication, c'est que la ligne existe (même si le SELECT RLS nous l'a cachée)
          if (insertError.code === '23505' || insertError.status === 409) {
            // ACTION : UNLIKE (Sécurité / Fallback)
            const { error: deleteErrorFallback } = await supabase
              .from('likes')
              .delete()
              .eq('post_id', postId)
              .eq('user_id', targetUserId);
              
            if (deleteErrorFallback) throw deleteErrorFallback;

            const newCountFallback = Math.max(0, currentCount - 1);
            await supabase.from('posts').update({ likes_count: newCountFallback }).eq('id', postId);
          } else {
            throw insertError;
          }
        } else {
          // L'insertion a réussi : Mettre à jour le compteur manuellement (+1)
          const newCount = currentCount + 1;
          const { error: updateError } = await supabase
            .from('posts')
            .update({ likes_count: newCount })
            .eq('id', postId);

          if (updateError) console.error("Erreur mise à jour compteur:", updateError.message);
        }
      }

      // 3. Récupération de l'état actualisé depuis la base de données (seule source de vérité)
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          likes_count,
          likes (user_id)
        `)
        .eq("id", postId)
        .single();

      if (postError) throw postError;

      const updatedLikesCount = postData.likes_count || 0;
      const updatedIsLikedByMe = postData.likes?.some(l => l.user_id === targetUserId) || false;

      // 4. Mettre à jour l'affichage en fonction de la base de données
      setPosts(prev => prev.map(p => 
        Number(p.id) === Number(postId) 
          ? { ...p, likes_count: updatedLikesCount, isLikedByMe: updatedIsLikedByMe } 
          : p
      ));

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


