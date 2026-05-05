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
            .from('invitations')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('status', 'pending');

        // Pour les messages, on compte le nombre de PERSONNES uniques qui ont envoyé des messages non lus
        const { data: unreadMessages } = await supabase
            .from('messages')
            .select('sender_id')
            .eq('is_read', false)
            .neq('sender_id', user.id);

        // On filtre pour ne garder que les messages appartenant aux conversations de l'utilisateur 
        // (En théorie, messages.sender_id != user.id suffit si on est dans la conv, 
        // mais pour être sûr on pourrait filtrer par conversation_id)
        
        // Calculer le nombre d'expéditeurs uniques
        const uniqueSenders = new Set(unreadMessages?.map(m => m.sender_id)).size;

        setBadges({
            notifications: notifCount || 0,
            invitations: invCount || 0,
            messages: uniqueSenders || 0
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
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'invitations', filter: `receiver_id=eq.${user.id}` },
                () => setBadges(b => ({ ...b, invitations: b.invitations + 1 })))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `is_read=eq.false` },
                (payload) => {
                    // Si le message n'est pas de nous, on rafraîchit le compte des messages (car unique senders est complexe en local)
                    if (payload.new.sender_id !== user.id) {
                        fetchInitialCounts();
                    }
                })
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