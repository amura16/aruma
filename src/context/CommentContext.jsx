import React, { createContext, useContext } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const CommentContext = createContext(null);

export const CommentProvider = ({ children }) => {
  const { user } = useAuth();

  const addComment = async (postId, content) => {
    if (!user) return;
    return await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content });
  };

  const addReply = async (commentId, content) => {
    if (!user) return;
    return await supabase.from('comment_replies').insert({ comment_id: commentId, user_id: user.id, content });
  };

  const deleteComment = async (id) => await supabase.from('comments').delete().eq('id', id);
  const deleteReply = async (id) => await supabase.from('comment_replies').delete().eq('id', id);

  return (
    <CommentContext.Provider value={{ addComment, addReply, deleteComment, deleteReply }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useComments = () => useContext(CommentContext);