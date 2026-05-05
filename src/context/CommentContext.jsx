import React, { createContext, useContext } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const CommentContext = createContext(null);

export const CommentProvider = ({ children }) => {
  const { user } = useAuth();

  const addComment = async (postId, content) => {
    if (!user) return;
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

  const addReply = async (commentId, content) => {
    if (!user) return;
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
          type: 'comment',
          content: 'a répondu à votre commentaire'
        });
      }
    }
    return { data, error };
  };

  const deleteComment = async (id) => await supabase.from('comments').delete().eq('id', id);
  const deleteReply = async (id) => await supabase.from('comment_replies').delete().eq('id', id);
  const updateComment = async (id, content) => await supabase.from('comments').update({ content }).eq('id', id);
  const updateReply = async (id, content) => await supabase.from('comment_replies').update({ content }).eq('id', id);

  return (
    <CommentContext.Provider value={{ addComment, addReply, deleteComment, deleteReply, updateComment, updateReply }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useComments = () => useContext(CommentContext);