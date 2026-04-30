import React, { useState } from 'react';
import { X, ChevronLeft, Maximize2 } from 'lucide-react';

const MediaGrid = ({ title, items, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Aperçu limité à 9 éléments pour la barre latérale
  const previewItems = items.slice(0, 9);

  const handleMediaClick = (item) => {
    setSelectedMedia(item);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">{title}</h3>
          {items.length > 0 && (
            <button 
              onClick={() => setIsOpen(true)}
              className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition text-sm font-medium"
            >
              Montrer tout
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden">
          {previewItems.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => handleMediaClick(item)}
              className="aspect-square bg-gray-100 group cursor-pointer relative overflow-hidden"
            >
              {type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="media" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- LAYOUT DÉDIÉ : VOIR TOUS LES MÉDIAS --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header du Layout */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={28} className="text-gray-800" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="text-gray-500 font-medium">
              {items.length} {type === 'video' ? 'vidéos' : 'photos'}
            </div>
          </div>

          {/* Grille de contenu */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F0F2F5]">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleMediaClick(item)}
                    className="aspect-square bg-white rounded-2xl shadow-sm border border-white overflow-hidden group cursor-pointer hover:ring-4 hover:ring-blue-500/30 transition-all duration-300 relative"
                  >
                    {type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="full-media" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- VISIONNEUSE (LIGHTBOX) --- */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setSelectedMedia(null)}
          ></div>
          
          <button 
            onClick={() => setSelectedMedia(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-10"
          >
            <X size={32} />
          </button>

          <div className="relative max-w-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-300">
            {type === 'video' ? (
              <video 
                src={selectedMedia.url} 
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" 
                controls 
                autoPlay 
              />
            ) : (
              <img 
                src={selectedMedia.url} 
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" 
                alt="preview" 
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MediaGrid;