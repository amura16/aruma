import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Vérifier si un choix a déjà été fait dans le navigateur
    const savedTheme = localStorage.getItem('aruma-theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    // Appliquer la classe 'dark' au document HTML
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aruma-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aruma-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
