import React, { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../services/supabaseClient';

const FriendsListModal = ({ isOpen, onClose, userId, userName }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen || !userId) return;

        const fetchFriendsList = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('friends')
                    .select(`
            user_id1, user_id2,
            p1:profiles!friends_user_id1_fkey(id, firstname, lastname, username, avatar_url),
            p2:profiles!friends_user_id2_fkey(id, firstname, lastname, username, avatar_url)
          `)
                    .or(`user_id1.eq.${userId},user_id2.eq.${userId}`);

                if (error) throw error;

                const formatted = data.map(f => {
                    const profile = f.user_id1 === userId ? f.p2 : f.p1;
                    return profile;
                });

                setFriends(formatted);
            } catch (err) {
                console.error("Erreur liste amis:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFriendsList();
    }, [isOpen, userId]);

    if (!isOpen) return null;

    const filteredFriends = friends.filter(f =>
        `${f.firstname} ${f.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg">Amis de {userName}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un ami..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex justify-center py-10 text-gray-500">Chargement...</div>
                    ) : filteredFriends.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">Aucun ami trouvé</div>
                    ) : (
                        filteredFriends.map(friend => (
                            <div
                                key={friend.id}
                                onClick={() => {
                                    navigate(`/user/${friend.id}`);
                                    onClose();
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition group"
                            >
                                <img
                                    src={friend.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${friend.firstname}`}
                                    className="w-12 h-12 rounded-full object-cover border"
                                    alt=""
                                />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 group-hover:text-blue-600">
                                        {friend.firstname} {friend.lastname}
                                    </p>
                                    <p className="text-sm text-gray-500">@{friend.username}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendsListModal;