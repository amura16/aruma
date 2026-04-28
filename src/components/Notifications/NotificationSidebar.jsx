import React from 'react';
import { Bell, Settings } from 'lucide-react';

const NotificationSidebar = () => {
  const filters = [
    { label: "Toutes", active: true },
    { label: "Non lues", active: false },
  ];

  return (
    <aside className="hidden lg:flex w-[360px] bg-white border-r border-gray-200 h-full flex-col sticky top-[112px] self-start">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
          <Settings size={20} />
        </div>
      </div>

      <div className="px-4 mb-2">
        <h3 className="font-bold text-[17px] mb-4">Trier par</h3>
        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.label}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                filter.active 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default NotificationSidebar;