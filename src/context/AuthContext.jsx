import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

const AuthContext = createContext();

const CURRENT_USER_ID = '550e8400-e29b-41d4-a716-446655440001';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', CURRENT_USER_ID)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (err) {
        console.error("Erreur lors de la récupération du profil:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (newData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(newData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setUser(data);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
