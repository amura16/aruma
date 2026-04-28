import React from 'react';
import NavBar from '../components/Layout/Navbar';
import NotificationSidebar from '../components/Notifications/NotificationSidebar';
import NotificationItem from '../components/Notifications/NotificationItem';

const Notifications = () => {
  const notificationData = [
    {
      id: 1,
      user: "Inès Bella",
      action: "a aimé votre publication :",
      target: '"Le futur de React en 2026"',
      time: "Il y a 2 min",
      isRead: false,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ines"
    },
    {
      id: 2,
      user: "Thomas Durant",
      action: "a commenté votre photo",
      target: "",
      time: "Il y a 1 heure",
      isRead: false,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas"
    },
    {
      id: 3,
      user: "ArumA Tech",
      action: "vous a envoyé une invitation à aimer sa page",
      target: "",
      time: "Il y a 3 heures",
      isRead: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />
      
      <div className="flex max-w-[1200px] mx-auto min-h-[calc(100vh-112px)]">
        {/* Barre latérale de filtrage */}
        <NotificationSidebar />

        {/* Liste des notifications */}
        <main className="flex-1 bg-white lg:bg-transparent px-2 md:px-8 py-4">
          <div className="max-w-[680px] mx-auto">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-xl font-bold">Plus récentes</h3>
              <button className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-medium transition">
                Tout marquer comme lu
              </button>
            </div>

            <div className="space-y-1 bg-white rounded-xl shadow-sm overflow-hidden p-2">
              {notificationData.map((notif) => (
                <NotificationItem 
                  key={notif.id}
                  user={notif.user}
                  action={notif.action}
                  target={notif.target}
                  time={notif.time}
                  isRead={notif.isRead}
                  avatar={notif.avatar}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;