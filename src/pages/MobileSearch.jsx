import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';

const MobileSearch = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Auto focus au chargement
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-white md:hidden">
      {/* Header avec barre de recherche intégrée */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft size={24} />
        </button>

        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher sur ArumA..."
            className="w-full bg-gray-100 py-2.5 pl-4 pr-10 rounded-full text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 rounded-full hover:bg-blue-50"
            disabled={!query.trim()}
          >
            <SearchIcon size={20} className={!query.trim() ? "text-gray-400" : ""} />
          </button>
        </form>
      </div>

      {/* Suggestion ou Historique pourrait aller ici */}
      <div className="p-6 text-center mt-10">
        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <SearchIcon size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Recherche</h3>
        <p className="text-sm text-gray-500">
          Entrez des mots-clés ci-dessus pour trouver des amis, des publications, des photos ou des vidéos.
        </p>
      </div>
    </div>
  );
};

export default MobileSearch;
