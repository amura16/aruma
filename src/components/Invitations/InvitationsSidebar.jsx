import React from 'react';
import { UserPlus, Users } from 'lucide-react';

const InvitationsSidebar = ({ view, setView }) => {
  const menuItems = [
    {
      key: "invitations",
      label: "Invitations",
      icon: <UserPlus size={22} />
    },
    {
      key: "friends",
      label: "Amis",
      icon: <Users size={22} />
    }
  ];

  return (
    <aside className="w-full lg:w-[360px] bg-white border-r border-gray-200 h-full flex flex-col sticky top-[112px]">

      {/* HEADER */}
      <div className="p-4">
        <h2 className="text-2xl font-bold">Amis</h2>
        <p className="text-sm text-gray-500">
          Gère tes relations
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-2 space-y-1">

        {menuItems.map((item) => {
          const active = view === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${active
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <div className={active ? "text-blue-600" : "text-gray-500"}>
                {item.icon}
              </div>

              <span className="text-[15px]">
                {item.label}
              </span>
            </button>
          );
        })}

      </nav>

    </aside>
  );
};

export default InvitationsSidebar;