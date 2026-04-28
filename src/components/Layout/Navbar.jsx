import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, MessageCircle, Bell, Tv, Menu, User } from 'lucide-react';
import NavItem from '../UI/NavItem';
import SearchBar from '../UI/SearchBar'; // Import de ton nouveau composant

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Fonction pour vérifier si l'onglet est actif
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* --- Couche Supérieure --- */}
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <h1 
            onClick={() => navigate('/')} 
            className="text-blue-600 font-black text-2xl tracking-tighter cursor-pointer"
          >
            ArumA
          </h1>
          
          {/* Utilisation de ta SearchBar propre */}
          <div className="hidden md:block ml-2">
            <SearchBar 
              placeholder="Rechercher sur ArumA" 
              fullWidth={false} 
              className="w-64" 
            />
          </div>
        </div>

        {/* Navigation Desktop (Milieu) */}
        <div className="hidden lg:flex w-full max-w-xl justify-between px-2">
          <NavItem icon={<Home size={26} />} active={isActive('/')} onClick={() => navigate('/')} />
          <NavItem icon={<Users size={26} />} badge="3" onClick={() => navigate('/friends')} />
          <NavItem icon={<MessageCircle size={26} />} onClick={() => navigate('/messages')} />
          <NavItem icon={<Bell size={26} />} badge="9+" onClick={() => navigate('/notifications')} />
          <NavItem icon={<Tv size={26} />} onClick={() => navigate('/watch')} />
        </div>

        {/* Actions Droite */}
        <div className="flex items-center gap-2">
          <button className="md:hidden p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <SearchBar placeholder="" className="w-6" bgColor="bg-transparent" /> {/* Juste l'icône via SearchBar ? Ou garde ton bouton actuel */}
          </button>
          
          <button className="md:hidden p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Menu size={20} />
          </button>
          
          {/* Profil : Redirige vers la page profil */}
          <div 
            onClick={() => navigate('/profile')}
            className={`hidden md:flex w-10 h-10 rounded-full border-2 items-center justify-center cursor-pointer overflow-hidden transition-all ${
              isActive('/profile') ? 'border-blue-600' : 'border-transparent hover:bg-gray-200'
            }`}
          >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="profile" />
          </div>
        </div>
      </div>

      {/* --- Couche Inférieure (Mobile) --- */}
      <div className="lg:hidden flex justify-center border-t border-gray-100">
        <div className="flex w-full max-w-2xl justify-between px-2">
          <NavItem icon={<Home size={26} />} active={isActive('/')} onClick={() => navigate('/')} />
          <NavItem icon={<Users size={26} />} badge="3" onClick={() => navigate('/friends')} />
          <NavItem icon={<MessageCircle size={26} />} onClick={() => navigate('/messages')} />
          <NavItem icon={<Bell size={26} />} badge="9+" onClick={() => navigate('/notifications')} />
          <NavItem icon={<Tv size={26} />} onClick={() => navigate('/watch')} />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;