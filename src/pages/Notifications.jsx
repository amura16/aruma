import React, { useState } from 'react';
import NavBar from '../components/Layout/Navbar';
import NotificationSidebar from '../components/Notifications/NotificationSidebar';
import NotificationItem from '../components/Notifications/NotificationItem';
import { useNotifications } from '../hooks/useNotifications';
import { Loader2 } from 'lucide-react';

const Notifications = () => {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // 🔥 GLOBAL FILTER (desktop + mobile sidebar sync)
  const [filter, setFilter] = useState("all");

  // -----------------------------
  // FILTER LOGIC (SOURCE UNIQUE)
  // -----------------------------
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "like") return n.type === "like";
    if (filter === "comment") return n.type === "comment";
    if (filter === "post") return n.type === "post";
    return true;
  });

  // -----------------------------
  // FORMAT TIME
  // -----------------------------
  const formatTime = (date) => {
    const diff = (new Date() - new Date(date)) / 1000;

    if (diff < 60) return "à l’instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    return new Date(date).toLocaleDateString();
  };

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />

      <div className="flex max-w-[1200px] mx-auto min-h-[calc(100vh-112px)]">

        {/* 💻 SIDEBAR DESKTOP (TRI COMPLET ICI) */}
        <NotificationSidebar
          filter={filter}
          setFilter={setFilter}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 px-2 md:px-8 py-4">

          <div className="max-w-[680px] mx-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-xl font-bold">Notifications</h3>

              <button
                onClick={markAllAsRead}
                className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-medium transition"
              >
                Tout marquer comme lu
              </button>
            </div>

            {/* 📱 MOBILE FILTERS (inchangé, indépendant du desktop) */}
            <div className="flex lg:hidden gap-2 mb-3 overflow-x-auto px-2">
              {[
                { key: "all", label: "Toutes" },
                { key: "unread", label: "Non lues" },
                { key: "like", label: "Likes" },
                { key: "comment", label: "Commentaires" },
                { key: "post", label: "Posts" }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === f.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* LIST */}
            <div className="space-y-1 bg-white rounded-xl shadow-sm overflow-hidden p-2">

              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => {
                  const user = notif.actor;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className="cursor-pointer"
                    >
                      <NotificationItem
                        user={`${user?.firstname || ''} ${user?.lastname || ''}`}
                        action={
                          notif.type === 'like'
                            ? "a aimé votre publication"
                            : notif.type === 'comment'
                              ? "a commenté votre publication"
                              : notif.type === 'post'
                                ? "a publié un post"
                                : "a interagi avec votre contenu"
                        }
                        target={notif.content || ""}
                        time={formatTime(notif.created_at)}
                        isRead={notif.is_read}
                        avatar={user?.avatar_url}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center text-gray-400 text-sm">
                  Aucune notification
                </div>
              )}

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;