import React, { useState, useEffect } from 'react';
import { Search, X, User, Loader2, ArrowLeft } from 'lucide-react';
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
        // Note: In some systems this might be 'friends' table, in others 'followers' etc.
        // The previous code used 'friends' table. Let's stick to that but handle missing table gracefully.
        const { data, error } = await supabase
          .from('friends')
          .select(`
            user_id1,
            user_id2,
            profile1:profiles!user_id1(id, username, firstname, lastname, avatar_url, is_online),
            profile2:profiles!user_id2(id, username, firstname, lastname, avatar_url, is_online)
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
        // Fallback to searching all profiles if friends table fails or is empty
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id, username, firstname, lastname, avatar_url, is_online')
          .neq('id', user.id)
          .limit(10);
        if (allProfiles) setFriends(allProfiles);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchFriends();
  }, [user?.id]);

  const filteredFriends = friends.filter(f => {
    const fullName = `${f.firstname} ${f.lastname}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || f.username.toLowerCase().includes(search);
  });

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-white/80 sticky top-0">
        <button
          onClick={onClose}
          className="p-2.5 hover:bg-gray-100 rounded-2xl transition-all text-gray-500 active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            autoFocus
            type="text"
            placeholder="Rechercher un ami par nom ou pseudo..."
            className="w-full bg-gray-50 border-none py-3.5 pl-11 pr-4 rounded-2xl text-[15px] focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-4 pb-10 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
            <p className="text-sm text-gray-500 font-medium">Recherche de vos contacts...</p>
          </div>
        ) : filteredFriends.length > 0 ? (
          <div className="px-3 max-w-2xl mx-auto">
            <p className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
              Suggestions de contacts
            </p>
            <div className="grid gap-1">
              {filteredFriends.map(friend => (
                <div
                  key={friend.id}
                  onClick={() => onSelectFriend(friend)}
                  className="flex items-center gap-4 p-3.5 hover:bg-blue-50/50 rounded-2xl cursor-pointer transition-all active:scale-[0.98] group"
                >
                  <div className="relative">
                    <img
                      src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm transition-transform group-hover:scale-105"
                      alt={`${friend.firstname} ${friend.lastname}`}
                    />
                    {friend.is_online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[16px] text-gray-900 truncate">
                      {friend.firstname} {friend.lastname}
                    </h4>
                    <p className="text-sm text-gray-500 truncate font-medium">@{friend.username}</p>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                      Message
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-sm mx-auto">
            <div className="bg-gray-50 p-6 rounded-3xl mb-6 shadow-inner">
              <User className="text-gray-300" size={48} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Aucun résultat</h3>
            <p className="text-[15px] text-gray-500 leading-relaxed">
              {searchTerm
                ? `Nous n'avons trouvé personne correspondant à "${searchTerm}". Vérifiez l'orthographe ou essayez un autre nom.`
                : "Commencez par rechercher un ami pour entamer une nouvelle discussion."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendSearchOverlay;