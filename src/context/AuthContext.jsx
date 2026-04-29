import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'felix-123',
    name: 'Felix Dev',
    username: 'felixdev',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    cover_url: 'https://images.unsplash.com/photo-1557683316-973673baf926',
    bio: 'Développeur passionné par ArumA 🚀',
  });

  const [loading, setLoading] = useState(false);

  const updateProfile = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
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
