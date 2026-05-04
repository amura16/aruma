import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const CommentContext = createContext(null);

export const CommentProvider = ({ children }) => {
  const { user } = useAuth();

  // Fonction pour ajouter un commentaire
  const addComment = async (postId, content) => {
    if (!user) return;
    const { error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, content });
    if (error) throw error;
  };

  // Fonction pour ajouter une réponse
  const addReply = async (commentId, content) => {
    if (!user) return;
    const { error } = await supabase
      .from('comment_replies')
      .insert({ comment_id: commentId, user_id: user.id, content });
    if (error) throw error;
  };

  // Suppression
  const deleteComment = async (id) => {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;
  };

  const deleteReply = async (id) => {
    const { error } = await supabase.from('comment_replies').delete().eq('id', id);
    if (error) throw error;
  };

  // Édition
  const updateComment = async (id, content) => {
    const { error } = await supabase.from('comments').update({ content }).eq('id', id);
    if (error) throw error;
  };

  const updateReply = async (id, content) => {
    const { error } = await supabase.from('comment_replies').update({ content }).eq('id', id);
    if (error) throw error;
  };

  return (
    <CommentContext.Provider value={{ 
      addComment, addReply, deleteComment, deleteReply, updateComment, updateReply 
    }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useComments = () => {
  const context = useContext(CommentContext);
  if (!context) throw new Error("useComments doit être utilisé dans CommentProvider");
  return context;
};