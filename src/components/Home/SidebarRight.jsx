import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, MoreHorizontal, Search } from 'lucide-react';
import supabase from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const ContactLine = ({ friend, onClick }) => (
  <div
    onClick={() => onClick(friend.id)}
    className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-xl cursor-pointer transition-all group"
  >
    <div className="relative shrink-0">
      <img
        src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`}
        className="w-9 h-9 rounded-full object-cover border border-gray-100"
        alt=""
      />
      {/* Indicateur de statut (fixe car pas de gestion de présence en BDD) */}
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
    </div>
    <span className="font-medium text-[15px] text-gray-800 group-hover:text-blue-600 transition-colors">
      {friend.firstname} {friend.lastname}
    </span>
  </div>
);

const SidebarRight = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // On récupère les colonnes id, user_id1, user_id2 et on joint les profils associés
        const { data, error } = await supabase
          .from('friends')
          .select(`
            user_id1,
            user_id2,
            user1:profiles!user_id1(id, firstname, lastname, avatar_url),
            user2:profiles!user_id2(id, firstname, lastname, avatar_url)
          `)
          .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

        if (error) throw error;

        // On extrait le profil de l'ami (celui qui n'est pas l'utilisateur actuel)
        const formattedFriends = data.map(rel => {
          return rel.user_id1 === user.id ? rel.user2 : rel.user1;
        }).filter(f => f !== null); // Sécurité contre les profils supprimés

        setFriends(formattedFriends);
      } catch (err) {
        console.error("Erreur chargement amis:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  // Filtrage local pour la barre de recherche
  const filteredFriends = friends.filter(f =>
    `${f?.firstname} ${f?.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-[112px] self-start h-[calc(100vh-112px)]">
      <div className="h-full overflow-y-auto custom-scrollbar py-2 px-2">

        {/* Header */}
        <div className="flex justify-between items-center px-2 mb-4 text-gray-600">
          <h3 className="font-bold text-[17px]">Contacts</h3>
          <div className="flex gap-2">
            <Video size={18} className="cursor-pointer hover:bg-gray-100 rounded-full p-1 w-7 h-7 transition-colors" />
            <MoreHorizontal size={18} className="cursor-pointer hover:bg-gray-100 rounded-full p-1 w-7 h-7 transition-colors" />
          </div>
        </div>

        {/* Barre de recherche locale */}
        <div className="px-2 mb-4">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Rechercher un ami..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 py-2 pl-9 pr-4 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Liste des contacts dynamiques */}
        <div className="space-y-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-xs text-gray-400">Chargement...</span>
            </div>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <ContactLine
                key={friend.id}
                friend={friend}
                onClick={(id) => navigate(`/profile/${id}`)}
              />
            ))
          ) : (
            <div className="text-center py-10 px-4">
              <p className="text-gray-400 text-sm italic">
                {searchTerm ? "Aucun ami ne correspond à cette recherche." : "Votre liste d'amis est vide."}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarRight;