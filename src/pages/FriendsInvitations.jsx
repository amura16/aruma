import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import NavBar from '../components/Layout/Navbar';
import InvitationsSidebar from '../components/Invitations/InvitationsSidebar';
import FriendRequestCard from '../components/Invitations/FriendRequestCard';

import { useFriendsContext } from '../context/FriendsContext';
import { useAuth } from '../context/AuthContext';

const FriendsInvitations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // On récupère tout depuis le Context global
  const {
    friends,       // Liste des amis synchronisée
    invitations,   // Invitations reçues synchronisées
    loading,       // État de chargement global
    acceptInvitation,
    declineInvitation
  } = useFriendsContext();

  const [view, setView] = useState("invitations");

  // -----------------------------
  // FORMATAGE DES AMIS
  // -----------------------------
  // Note : Dans le nouveau Context, les profils sont déjà extraits 
  // et filtrés. On n'a plus besoin de logique complexe ici.
  const formattedFriends = useMemo(() => {
    return (friends || []).map((f) => ({
      id: f.id,
      name: `${f.firstname || ''} ${f.lastname || ''}`.trim() || "Utilisateur",
      username: f.username || 'inconnu',
      avatar: f.avatar_url || null,
      // Si vous avez besoin de la date d'amitié, assurez-vous qu'elle est 
      // renvoyée par le fetchFriends du Context
      created_at: f.created_at || new Date().toISOString()
    }));
  }, [friends]);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-112px)]">

        {/* SIDEBAR */}
        <InvitationsSidebar
          view={view}
          setView={setView}
        />

        {/* MAIN */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {view === "friends" ? "Amis" : "Invitations"}
              </h3>

              <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full font-medium">
                {view === "friends" ? formattedFriends.length : invitations.length}
              </span>
            </div>

            {/* CHARGEMENT INITIAL */}
            {loading && friends.length === 0 && invitations.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Chargement...
              </div>
            ) : (
              <>
                {/* ===================== */}
                {/* VUE INVITATIONS */}
                {/* ===================== */}
                {view === "invitations" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {invitations.length === 0 ? (
                      <div className="col-span-full text-center text-gray-500 py-20 bg-white rounded-xl border border-dashed">
                        Aucune invitation reçue pour le moment.
                      </div>
                    ) : (
                      invitations.map((inv) => (
                        <FriendRequestCard
                          key={inv.id}
                          invitation={inv}
                        />
                      ))
                    )}
                  </div>
                )}

                {/* ===================== */}
                {/* VUE AMIS */}
                {/* ===================== */}
                {view === "friends" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {formattedFriends.length === 0 ? (
                      <div className="col-span-full text-center text-gray-500 py-20 bg-white rounded-xl border border-dashed">
                        Vous n'avez pas encore d'amis.
                      </div>
                    ) : (
                      formattedFriends.map((friend) => (
                        <div
                          key={friend.id}
                          onClick={() => navigate(`/user/${friend.id}`)}
                          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={friend.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${friend.name}`}
                              className="w-12 h-12 rounded-full object-cover border border-gray-100"
                              alt={friend.name}
                            />
                            <div className="overflow-hidden">
                              <p className="font-bold text-gray-900 group-hover:text-blue-600 truncate">
                                {friend.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                @{friend.username}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                              Ami depuis {new Date(friend.created_at).toLocaleDateString()}
                            </span>
                            <button className="text-blue-600 text-xs font-bold hover:underline">
                              Voir profil
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default FriendsInvitations;