import React from 'react';

const MediaGrid = ({ title, items, type }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold">{title}</h3>
        <button className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition text-sm font-medium">
          Montrer tout
        </button>
      </div>

      {/* 3 colonnes sur mobile, 3 sur tablette (mais plus grand), et s'adapte en desktop */}
      <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden">
        {items.map((item, idx) => (
          <div key={idx} className="aspect-square bg-gray-100 group cursor-pointer relative">
            {type === 'video' ? (
              <video src={item.url} className="w-full h-full object-cover" />
            ) : (
              <img src={item.url} className="w-full h-full object-cover hover:opacity-90 transition" alt="media" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGrid;