import React, { useState, useEffect } from 'react';
import { Loader2, BellOff } from 'lucide-react';
import NavBar from '../components/Layout/Navbar';
import NotificationSidebar from '../components/Notifications/NotificationSidebar';
import { useAuth } from '../context/AuthContext';
import supabase from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Chargement initial avec jointure sur les profils (actor_id)
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select(`
          id, user_id, actor_id, post_id, type, content, is_read, created_at,
          actor:profiles!actor_id(firstname, lastname, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== "all") {
        if (filter === "unread") query = query.eq('is_read', false);
        else query = query.eq('type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Erreur chargement:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Realtime : Écoute des nouveaux enregistrements
  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    const channel = supabase
      .channel(`realtime-notifs-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newNotif = payload.new;

          // Récupération manuelle du profil de l'acteur pour l'affichage immédiat
          const { data: actorProfile } = await supabase
            .from('profiles')
            .select('firstname, lastname, avatar_url')
            .eq('id', newNotif.actor_id)
            .single();

          const completeNotif = { ...newNotif, actor: actorProfile };

          setNotifications((prev) => {
            // Logique de filtrage en temps réel
            if (filter === "all" || filter === completeNotif.type || (filter === "unread" && !completeNotif.is_read)) {
              return [completeNotif, ...prev];
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, filter]);

  // 3. Marquer comme lu
  const handleMarkAsRead = async (notif) => {
    if (notif.is_read) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notif.id);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <NavBar />

      <div className="max-w-[1200px] mx-auto flex gap-6 pt-[112px] px-4">
        <NotificationSidebar filter={filter} setFilter={setFilter} />

        <main className="flex-1 pb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            <div className="p-4 border-b bg-white flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      handleMarkAsRead(notif);
                      if (notif.post_id) navigate(`/post/${notif.post_id}`);
                    }}
                    className={`p-4 flex items-start gap-4 hover:bg-gray-50 transition-all cursor-pointer ${!notif.is_read ? 'bg-blue-50/40 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                      }`}
                  >
                    <img
                      src={notif.actor?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${notif.actor?.firstname}`}
                      className="w-12 h-12 rounded-full object-cover border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                      alt=""
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/${notif.actor_id}`);
                      }}
                    />

                    <div className="flex-1">
                      <p className="text-[15px] text-gray-800 leading-snug">
                        <span 
                          className="font-bold text-gray-900 hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/user/${notif.actor_id}`);
                          }}
                        >
                          {notif.actor?.firstname} {notif.actor?.lastname}
                        </span> {notif.content}
                      </p>
                      <span className="text-xs text-blue-600 font-bold mt-1 block">
                        {new Date(notif.created_at).toLocaleDateString()} à {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {!notif.is_read && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 self-center"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                  <BellOff className="text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-medium">Aucune notification.</p>
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