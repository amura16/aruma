import React, { useState } from 'react';
import { User, Lock, Moon, Sun, ChevronLeft } from 'lucide-react';
import NavBar from '../components/Layout/Navbar';
import SettingsItem from '../components/Settings/SettingsItem';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Logique pour changer le thème (ex: document.documentElement.classList.toggle('dark'))
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />

      <main className="max-w-[700px] mx-auto pt-6 px-4">
        {/* En-tête mobile/tablette */}
        <div className="flex items-center gap-4 mb-6 lg:hidden">
          <button className="p-2 hover:bg-gray-200 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Paramètres</h1>
        </div>

        <h1 className="hidden lg:block text-2xl font-bold mb-6">Paramètres</h1>

        <div className="space-y-6">
          {/* SECTION : COMPTE */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">
                Paramètres du compte
              </h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              <SettingsItem 
                icon={<User size={20} />}
                title="Informations personnelles"
                description={`Nom actuel : ${user.firstname} ${user.lastname}`}
                onClick={() => {
                  const newFirstname = prompt("Entrez votre nouveau prénom :", user.firstname);
                  const newLastname = prompt("Entrez votre nouveau nom :", user.lastname);
                  if (newFirstname || newLastname) {
                    updateProfile({ 
                      firstname: newFirstname || user.firstname, 
                      lastname: newLastname || user.lastname 
                    });
                  }
                }}
              />
              <SettingsItem 
                icon={<Lock size={20} />}
                title="Mot de passe et sécurité"
                description="Changez votre mot de passe et sécurisez votre compte"
                onClick={() => console.log("Vers changement mot de passe")}
              />
            </div>
          </section>

          {/* SECTION : AFFICHAGE */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">
                Affichage et accessibilité
              </h3>
            </div>

            <SettingsItem 
              icon={isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              title="Mode sombre"
              description="Ajustez l'apparence pour réduire l'éblouissement"
              action={
                <button 
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              }
            />
          </section>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-xs">
          <p>ArumA &copy; 2026</p>
          <p className="mt-1">Confidentialité · Conditions générales · Cookies</p>
        </footer>
      </main>
    </div>
  );
};

export default Settings;