import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Users, MessageCircle, Bell, Tv, Menu, User,
  LogOut, X, Search, Settings, ChevronRight, Bookmark,
  PlusCircle, Video
} from 'lucide-react';
import NavItem from '../UI/NavItem';
import SearchBar from '../UI/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { useBadges } from '../../context/NotificationBadgeContext';

const NavBar = () => {
  const { user, signOut } = useAuth();
  const { badges, clearBadge } = useBadges(); // Utilisation du contexte de badges
  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error("Erreur de déconnexion:", err.message);
    }
  };

  // Composant interne pour le badge rouge
  const RedBadge = ({ count }) => {
    if (!count || count <= 0) return null;
    return (
      <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-200 shadow-sm">
        {count > 9 ? '9+' : count}
      </span>
    );
  };

  const navLinks = [
    {
      id: 'home',
      path: '/',
      icon: <Home size={26} />,
      label: 'Accueil'
    },
    {
      id: 'friends',
      path: '/friend',
      icon: <div className="relative"><Users size={26} /><RedBadge count={badges.invitations} /></div>,
      label: 'Amis',
      color: 'text-green-600'
    },
    {
      id: 'messages',
      path: '/message',
      icon: <div className="relative"><MessageCircle size={26} /><RedBadge count={badges.messages} /></div>,
      label: 'Messages',
      color: 'text-sky-500'
    },
    {
      id: 'notifications',
      path: '/notification',
      icon: <div className="relative"><Bell size={26} /><RedBadge count={badges.notifications} /></div>,
      label: 'Notifications',
      color: 'text-orange-500'
    },
    {
      id: 'video',
      path: '/video',
      icon: <Tv size={26} />,
      label: 'Vidéos',
      color: 'text-red-500'
    },
  ];

  // const secondaryLinks = [
  //   { id: 'saved', path: '/saved', icon: <Bookmark size={22} />, label: 'Enregistrés', color: 'text-purple-600' },
  // ];

  const isPathActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (id, path) => {
    // Faire disparaître le badge au clic
    if (id === 'notifications') clearBadge('notifications');
    if (id === 'messages') clearBadge('messages');
    if (id === 'friends') clearBadge('invitations');

    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">

          {/* Logo & Recherche */}
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

          {/* Navigation Desktop (Centrale) */}
          <div className="hidden lg:flex w-full max-w-xl justify-between px-2">
            {navLinks.map((link) => (
              <NavItem
                key={link.id}
                icon={link.icon}
                active={isPathActive(link.path)}
                onClick={() => handleNavigation(link.id, link.path)}
              />
            ))}
          </div>

          {/* Profil & Dropdown Desktop */}
          <div className="hidden md:flex items-center gap-2 relative">
            <div className="relative">
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className={`w-10 h-10 rounded-full border-2 cursor-pointer overflow-hidden transition-all duration-200 ${location.pathname === '/profile' ? 'border-blue-600 scale-110' : 'border-transparent hover:bg-gray-100'
                  }`}
              >
                <img src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="Profil" />
              </div>

              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3 cursor-pointer" onClick={() => { navigate('/profile'); setShowDropdown(false); }}>
                      <img src={user?.avatar_url} className="w-10 h-10 rounded-full" alt="" />
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">{user?.firstname} {user?.lastname}</span>
                        <span className="text-xs text-gray-500">Voir mon profil</span>
                      </div>
                    </div>

                    <button onClick={() => { navigate('/setting'); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-[15px] font-semibold text-gray-700">
                      <div className="p-2 bg-gray-100 rounded-full"><Settings size={20} /></div> Paramètres
                    </button>

                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-[15px] font-semibold text-red-600">
                        <div className="p-2 bg-red-50 rounded-full"><LogOut size={20} /></div> Se déconnecter
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden flex items-center gap-1">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition active:scale-90" onClick={() => navigate('/mobile-search')}>
              <Search size={22} />
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 active:scale-90 transition relative">
              <Menu size={28} />
              {(badges.notifications + badges.messages + badges.invitations) > 0 && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab Bar Mobile (Bas de la nav) */}
        <div className="lg:hidden flex justify-center border-t border-gray-100 bg-white">
          <div className="flex w-full max-w-2xl justify-between px-2">
            {navLinks.map((link) => (
              <NavItem
                key={link.id}
                icon={link.icon}
                active={isPathActive(link.path)}
                onClick={() => handleNavigation(link.id, link.path)}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Overlay Menu Mobile Complet */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-50 animate-in slide-in-from-bottom duration-300 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-white border-b shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
            <button className="p-2 bg-gray-100 rounded-full" onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div onClick={() => handleNavigation('profile', '/profile')} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50">
              <div className="flex items-center gap-3">
                <img src={user?.avatar_url} className="w-12 h-12 rounded-full border-2 border-blue-50" alt="" />
                <div>
                  <h3 className="font-bold text-gray-900">{user?.firstname} {user?.lastname}</h3>
                  <p className="text-xs text-gray-500">Voir mon profil</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[...navLinks].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id, item.path)}
                  className="flex flex-col items-start p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all relative"
                >
                  <div className={`p-2 rounded-xl bg-gray-50 mb-3 ${item.color}`}>{item.icon}</div>
                  <span className="text-sm font-bold text-gray-700">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button onClick={() => handleNavigation('settings', '/setting')} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-700"><Settings size={20} /></div>
                <span className="font-semibold text-gray-700">Paramètres</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-t border-gray-50 transition text-red-600 font-bold" onClick={handleLogout}>
                <div className="p-2 bg-red-50 rounded-lg"><LogOut size={20} /></div>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;