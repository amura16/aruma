import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const BadgeContext = createContext();

export const BadgeProvider = ({ children }) => {
    const { user } = useAuth();
    const [badges, setBadges] = useState({
        notifications: 0,
        messages: 0,
        invitations: 0
    });

    const fetchInitialCounts = async () => {
        if (!user) return;

        // Compter les notifications non lues
        const { count: notifCount } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        // Compter les invitations en attente (reçues)
        const { count: invCount } = await supabase
            .from('friend_requests') // Adaptez le nom de la table si nécessaire
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('status', 'pending');

        // Pour les messages, on compte souvent les conversations avec des messages non lus
        // Ceci est un exemple simplifié
        const { count: msgCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('is_read', false);

        setBadges({
            notifications: notifCount || 0,
            invitations: invCount || 0,
            messages: msgCount || 0
        });
    };

    useEffect(() => {
        if (!user) return;
        fetchInitialCounts();

        // Ecoute Realtime pour les 3 tables
        const channel = supabase
            .channel('global-badges')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                () => setBadges(b => ({ ...b, notifications: b.notifications + 1 })))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friend_requests', filter: `receiver_id=eq.${user.id}` },
                () => setBadges(b => ({ ...b, invitations: b.invitations + 1 })))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
                () => setBadges(b => ({ ...b, messages: b.messages + 1 })))
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user]);

    const clearBadge = (type) => {
        setBadges(prev => ({ ...prev, [type]: 0 }));
    };

    return (
        <BadgeContext.Provider value={{ badges, clearBadge }}>
            {children}
        </BadgeContext.Provider>
    );
};

export const useBadges = () => useContext(BadgeContext);