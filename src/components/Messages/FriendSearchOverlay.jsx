import React, { useState, useEffect } from 'react';
import { Search, X, User, Loader2 } from 'lucide-react';
import supabase from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const FriendSearchOverlay = ({ onClose, onSelectFriend }) => {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setLoading(true);
                // On récupère les relations d'amitié où l'utilisateur est soit user_id1 soit user_id2
                const { data, error } = await supabase
                    .from('friends')
                    .select(`
            user_id1,
            user_id2,
            profile1:profiles!user_id1(id, username, firstname, lastname, avatar_url),
            profile2:profiles!user_id2(id, username, firstname, lastname, avatar_url)
          `)
                    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

                if (error) throw error;

                // On extrait uniquement le profil de l'ami (celui qui n'est pas nous)
                const friendList = data.map(rel =>
                    rel.user_id1 === user.id ? rel.profile2 : rel.profile1
                );

                setFriends(friendList);
            } catch (err) {
                console.error("Erreur lors de la récupération des amis:", err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchFriends();
    }, [user?.id]);

    // Filtrage local basé sur le nom, prénom ou username
    const filteredFriends = friends.filter(f => {
        const fullName = `${f.firstname} ${f.lastname}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || f.username.toLowerCase().includes(search);
    });

    return (
        <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom-2 duration-200">

            {/* Header de recherche */}
            <div className="p-4 border-b flex items-center gap-3 bg-white sticky top-0">
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    title="Fermer"
                >
                    <X size={20} />
                </button>

                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Rechercher un ami..."
                        className="w-full bg-gray-100 py-2.5 pl-10 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Liste des résultats */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <p className="text-sm">Chargement de vos contacts...</p>
                    </div>
                ) : filteredFriends.length > 0 ? (
                    <div className="p-2">
                        <p className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            Suggestions
                        </p>
                        {filteredFriends.map(friend => (
                            <div
                                key={friend.id}
                                onClick={() => onSelectFriend(friend)}
                                className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-all group"
                            >
                                <div className="relative">
                                    <img
                                        src={friend.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${friend.username}`}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                                        alt={`${friend.firstname} ${friend.lastname}`}
                                    />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-[15px] text-gray-900 truncate">
                                        {friend.firstname} {friend.lastname}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <User className="text-gray-300" size={40} />
                        </div>
                        <h3 className="text-gray-900 font-bold">Aucun ami trouvé</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {searchTerm
                                ? `Nous n'avons trouvé personne correspondant à "${searchTerm}"`
                                : "Vous n'avez pas encore d'amis ajoutés."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendSearchOverlay;