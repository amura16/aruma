import React, { useState } from 'react';
import { User, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/Layout/Navbar';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <NavBar />

      <main className="max-w-xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition lg:hidden">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        </div>

        <div className="space-y-4">
          {/* BOUTON : PARAMÈTRES DU COMPTE */}
          <button
            onClick={() => navigate('/account-settings')}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 shadow-sm hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <User size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">Paramètres du compte</h3>
                <p className="text-sm text-gray-500">Informations personnelles et sécurité</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        <footer className="mt-12 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">
          ArumA • Version 2.1.0
        </footer>
      </main>
    </div>
  );
};

export default Settings;