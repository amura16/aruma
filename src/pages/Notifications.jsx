import React from 'react';
import { Settings } from 'lucide-react';

const InvitationsSidebar = ({ active, onChange }) => {
  return (
    <aside className="w-full lg:w-[360px] bg-white border-r border-gray-200 h-full flex flex-col sticky top-[112px]">

      <div className="p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Amis</h2>
        <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
          <Settings size={20} />
        </div>
      </div>

      <div className="px-4">
        <h3 className="font-bold text-[17px] mb-4">Filtrer</h3>

        <div className="flex flex-col gap-2">

          <button
            onClick={() => onChange("invitations")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${active === "invitations"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100 text-gray-700"
              }`}
          >
            Invitations
          </button>

          <button
            onClick={() => onChange("friends")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${active === "friends"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100 text-gray-700"
              }`}
          >
            Amis
          </button>

        </div>
      </div>

    </aside>
  );
};

export default InvitationsSidebar;