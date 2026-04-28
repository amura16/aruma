import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ 
  placeholder = "Rechercher...", 
  className = "", 
  bgColor = "bg-gray-100", 
  textSize = "text-sm",
  fullWidth = true
}) => {
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