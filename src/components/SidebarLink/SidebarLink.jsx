import React from 'react';
import { Users, Tv, Clock, Bookmark, Flag, Calendar, ChevronDown } from 'lucide-react';

const SidebarLink = ({ icon, label }) => (
  <div className="flex items-center gap-3 p-3 hover:bg-gray-200 rounded-xl cursor-pointer transition-all duration-200">
    <div className="w-9 h-9 flex items-center justify-center">
      {/* On clone l'icône pour s'assurer qu'elle a la bonne taille */}
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <span className="font-medium text-[15px] text-gray-700">{label}</span>
  </div>
);

export default SidebarLink;