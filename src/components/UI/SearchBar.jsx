import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBar = ({ 
  placeholder = "Rechercher...", 
  className = "", 
  bgColor = "bg-gray-100", 
  textSize = "text-sm",
  fullWidth = true
}) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mettre à jour le champ si on est déjà sur la page de recherche avec une requête
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* L'icône est positionnée de manière absolue pour ne pas gêner le texte */}
      <Search 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" 
        size={18} 
      />
      <input 
        type="text" 
        placeholder={placeholder} 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`
          w-full 
          ${bgColor} 
          ${textSize} 
          py-2 pl-10 pr-4 
          rounded-full 
          focus:outline-none 
          transition-all
          border-none
        `}
      />
    </div>
  );
};

export default SearchBar;