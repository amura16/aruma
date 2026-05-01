import { useEffect } from "react";
import supabase from "../services/supabaseClient";

export const useFriendsRealtime = ({
    user,
    fetchInvitations,
    fetchFriends
}) => {

    useEffect(() => {
        if (!user?.id) return;

        // ============================
        // 📩 INVITATIONS REALTIME
        // ============================
        const invitationsChannel = supabase
            .channel("invitations-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "invitations",
                    filter: `receiver_id=eq.${user.id}`
                },
                (payload) => {
                    console.log("📩 invitation change:", payload);

                    // 🔥 force refresh
                    fetchInvitations?.();
                }
            )
            .subscribe();

        // ============================
        // 👥 FRIENDS REALTIME
        // ============================
        const friendsChannel = supabase
            .channel("friends-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "friends"
                },
                (payload) => {
                    console.log("👥 friends change:", payload);

                    fetchFriends?.();
                }
            )
            .subscribe();

        // ============================
        // 🧹 CLEANUP
        // ============================
        return () => {
            supabase.removeChannel(invitationsChannel);
            supabase.removeChannel(friendsChannel);
        };

    }, [user?.id]);
};