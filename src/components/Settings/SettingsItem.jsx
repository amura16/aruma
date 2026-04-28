import React from 'react';
import { ChevronRight } from 'lucide-react';

const SettingsItem = ({ icon, title, description, onClick, action }) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 hover:bg-gray-100 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-gray-200 rounded-full text-gray-700">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-[16px] text-gray-800">{title}</h4>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      
      <div className="flex items-center">
        {action ? action : <ChevronRight className="text-gray-400" size={20} />}
      </div>
    </div>
  );
};

export default SettingsItem;