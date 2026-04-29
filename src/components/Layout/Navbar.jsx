import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, MessageCircle, Bell, Tv, Menu } from 'lucide-react';
import NavItem from '../UI/NavItem';
import SearchBar from '../UI/SearchBar';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Configuration des onglets pour éviter la répétition
  const navLinks = [
    { id: 'home', path: '/', icon: <Home size={26} />, badge: null },
    { id: 'friends', path: '/friend', icon: <Users size={26} />, badge: "3" },
    { id: 'messages', path: '/message', icon: <MessageCircle size={26} />, badge: null },
    { id: 'notifications', path: '/notification', icon: <Bell size={26} />, badge: "9+" },
    { id: 'video', path: '/video', icon: <Tv size={26} />, badge: null },
  ];

  // Fonction pour déterminer si un chemin est actif
  const isPathActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* --- Barre Supérieure --- */}
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <h1 
            onClick={() => navigate('/')} 
            className="text-blue-600 font-black text-2xl tracking-tighter cursor-pointer select-none"
          >
            ArumA
          </h1>
          <div className="hidden md:block ml-2">
            <SearchBar placeholder="Rechercher sur ArumA" fullWidth={false} className="w-64" />
          </div>
        </div>

        {/* Navigation Desktop (Milieu) */}
        <div className="hidden lg:flex w-full max-w-xl justify-between px-2">
          {navLinks.map((link) => (
            <NavItem 
              key={link.id}
              icon={link.icon} 
              active={isPathActive(link.path)} 
              badge={link.badge}
              onClick={() => navigate(link.path)}
            />
          ))}
        </div>

        {/* Actions Droite (Profil & Menu) */}
        <div className="flex items-center gap-2">
          <button className="md:hidden p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <Menu size={20} />
          </button>
          
          <div 
            onClick={() => navigate('/profile')}
            className={`w-10 h-10 rounded-full border-2 cursor-pointer overflow-hidden transition-all duration-200 ${
              location.pathname === '/profile' ? 'border-blue-600 scale-110' : 'border-transparent hover:bg-gray-100'
            }`}
          >
            <img src={user.avatar_url} alt="Mon Profil" />
          </div>
        </div>
      </div>

      {/* --- Barre Inférieure (Mobile & Tablettes) --- */}
      <div className="lg:hidden flex justify-center border-t border-gray-100">
        <div className="flex w-full max-w-2xl justify-between px-2">
          {navLinks.map((link) => (
            <NavItem 
              key={link.id}
              icon={link.icon} 
              active={isPathActive(link.path)} 
              badge={link.badge}
              onClick={() => navigate(link.path)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;