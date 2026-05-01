import { useState, useEffect, useCallback, useRef } from "react";
import supabase from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

export const useNotifications = () => {
    const { user } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const channelRef = useRef(null);

    // -----------------------------
    // 1. FETCH NOTIFICATIONS
    // -----------------------------
    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        setLoading(true);

        const { data, error } = await supabase
            .from("notifications")
            .select(`
        id,
        user_id,
        actor_id,
        post_id,
        type,
        content,
        is_read,
        created_at,
        actor:actor_id (
          id,
          firstname,
          lastname,
          avatar_url
        )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (!error) {
            setNotifications(data);
        } else {
            console.error("fetchNotifications error:", error.message);
        }

        setLoading(false);
    }, [user]);

    // -----------------------------
    // 2. REALTIME NOTIFICATIONS
    // -----------------------------
    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        const channel = supabase
            .channel("notifications-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const newNotif = payload.new;

                    // ⚡ ajout instant UI
                    setNotifications((prev) => [newNotif, ...prev]);
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [user, fetchNotifications]);

    // -----------------------------
    // 3. MARK AS READ (one)
    // -----------------------------
    const markAsRead = async (id) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, is_read: true } : n
            )
        );

        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);
    };

    // -----------------------------
    // 4. MARK ALL AS READ
    // -----------------------------
    const markAllAsRead = async () => {
        if (!user) return;

        setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true }))
        );

        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);
    };

    // -----------------------------
    // 5. UNREAD COUNT
    // -----------------------------
    const unreadCount = notifications.filter(
        (n) => !n.is_read
    ).length;

    // -----------------------------
    // RETURN
    // -----------------------------
    return {
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    };
};