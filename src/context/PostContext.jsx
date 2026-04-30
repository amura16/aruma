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
            user:profiles!user_id (id, username, firstname, lastname, avatar_url),
            replies:comment_replies (
              *,
              user:profiles!user_id (id, username, firstname, lastname, avatar_url)
            )
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

    // --- 1. MISE À JOUR OPTIMISTE (Interface instantanée) ---
    // On sauvegarde le post original pour pouvoir annuler en cas d'erreur
    const originalPost = posts.find(p => Number(p.id) === Number(postId));
    if (!originalPost) return;

    const isCurrentlyLiked = originalPost.isLikedByMe;
    const optimisticLikesCount = Math.max(0, isCurrentlyLiked ? (originalPost.likes_count - 1) : (originalPost.likes_count + 1));

    // On met à jour l'état immédiatement sans attendre la BDD
    setPosts(prev => prev.map(p => 
      Number(p.id) === Number(postId) 
        ? { ...p, likes_count: optimisticLikesCount, isLikedByMe: !isCurrentlyLiked } 
        : p
    ));

    try {
      // --- 2. OPÉRATIONS BASE DE DONNÉES EN ARRIÈRE-PLAN ---
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (checkError) throw checkError;

      const { data: currentPost, error: postFetchError } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
        
      if (postFetchError) throw postFetchError;
      const currentCount = currentPost.likes_count || 0;

      if (existingLike) {
        // Le like existe -> on l'enlève (UNLIKE)
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', targetUserId);
          
        if (deleteError) throw deleteError;

        const newCount = Math.max(0, currentCount - 1);
        await supabase.from('posts').update({ likes_count: newCount }).eq('id', postId);
      } else {
        // Le like n'existe pas -> on l'ajoute (LIKE)
        const { error: insertError } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: targetUserId }]);
          
        if (insertError) {
          if (insertError.code === '23505' || insertError.status === 409) {
            // S'il existait déjà (mais caché), on le supprime (fallback)
            await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', targetUserId);
            const newCountFallback = Math.max(0, currentCount - 1);
            await supabase.from('posts').update({ likes_count: newCountFallback }).eq('id', postId);
          } else {
            throw insertError;
          }
        } else {
          const newCount = currentCount + 1;
          await supabase.from('posts').update({ likes_count: newCount }).eq('id', postId);
        }
      }

      // --- 3. SYNCHRONISATION FINALE SILENCIEUSE ---
      // On s'assure que le chiffre final est bien celui de la DB au cas où il y ait eu d'autres clics simultanés
      const { data: finalPostData, error: finalError } = await supabase
        .from("posts")
        .select(`likes_count, likes (user_id)`)
        .eq("id", postId)
        .single();

      if (!finalError && finalPostData) {
        setPosts(prev => prev.map(p => 
          Number(p.id) === Number(postId) 
            ? { ...p, likes_count: finalPostData.likes_count || 0, isLikedByMe: finalPostData.likes?.some(l => l.user_id === targetUserId) || false } 
            : p
        ));
      }

    } catch (err) {
      console.error("Erreur globale lors du like/unlike :", err.message);
      // --- ROLLBACK EN CAS D'ERREUR ---
      // Si la requête échoue, on remet le post dans son état d'origine
      setPosts(prev => prev.map(p => 
        Number(p.id) === Number(postId) ? originalPost : p
      ));
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
          return { ...post, comments: [...(post.comments || []), { ...data, replies: [] }] };
        }
        return post;
      }));
    } catch (err) {
      console.error("Erreur commentaire:", err.message);
    }
  };

  const addReply = async (postId, commentId, userId, content) => {
    try {
      const { data, error } = await supabase
        .from('comment_replies')
        .insert([{ comment_id: commentId, user_id: userId, content }])
        .select(`
          *,
          user:profiles!user_id (id, username, firstname, lastname, avatar_url)
        `)
        .single();

      if (error) throw error;

      setPosts(prev => prev.map(post => {
        if (Number(post.id) === Number(postId)) {
          return {
            ...post,
            comments: (post.comments || []).map(c => 
              Number(c.id) === Number(commentId)
                ? { ...c, replies: [...(c.replies || []), data] }
                : c
            )
          };
        }
        return post;
      }));
    } catch (err) {
      console.error("Erreur ajout réponse:", err.message);
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
      addReply,
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


