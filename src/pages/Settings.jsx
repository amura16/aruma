import React, { useState } from 'react';
import { User, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/Layout/Navbar';

const Settings = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

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
            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 shadow-sm hover:bg-gray-50'
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

          {/* BOUTON : MODE SOMBRE */}
          <div className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">Mode sombre</h3>
                <p className="text-sm text-gray-500">Ajuster l'apparence visuelle</p>
              </div>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors outline-none ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                isDarkMode ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">
          ArumA • Version 2.1.0
        </footer>
      </main>
    </div>
  );
};

export default Settings;