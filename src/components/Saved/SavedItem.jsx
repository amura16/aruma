import React from 'react';
import { MoreHorizontal, Bookmark } from 'lucide-react';

const SavedItem = ({ title, author, category, image, avatar }) => {
  return (
    <div className="flex gap-4 p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow group cursor-pointer">
      {/* Image de l'élément enregistré */}
      <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>

      {/* Détails */}
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div>
          <h3 className="font-bold text-[16px] md:text-[18px] text-gray-800 line-clamp-2 leading-snug">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <img src={avatar} className="w-5 h-5 rounded-full" alt="" />
            <p className="text-sm text-gray-500 truncate">
              Enregistré depuis la publication de <span className="font-semibold text-gray-700">{author}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="p-1.5 bg-gray-100 rounded-full">
            <Bookmark size={14} className="text-purple-600 fill-purple-600" />
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {category}
          </div>
        </div>
      </div>

      {/* Options */}
      <button className="self-start p-2 hover:bg-gray-100 rounded-full transition-colors">
        <MoreHorizontal size={20} className="text-gray-600" />
      </button>
    </div>
  );
};

export default SavedItem;