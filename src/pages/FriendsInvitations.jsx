import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import NavBar from '../components/Layout/Navbar';
import InvitationsSidebar from '../components/Invitations/InvitationsSidebar';
import FriendRequestCard from '../components/Invitations/FriendRequestCard';

import { useFriendContext } from '../context/FriendContext';
import { useAuth } from '../context/AuthContext';
import supabase from '../services/supabaseClient';

const FriendsInvitations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    invitations,
    acceptInvitation,
    declineInvitation,
    loading
  } = useFriendContext();

  const [view, setView] = useState("invitations");
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // -----------------------------
  // FETCH FRIENDS (REAL DB)
  // -----------------------------
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.id) return;

      setLoadingFriends(true);

      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          user_id1,
          user_id2,
          created_at,
          profile1:profiles!friends_user_id1_fkey(
            id,
            firstname,
            lastname,
            username,
            avatar_url
          ),
          profile2:profiles!friends_user_id2_fkey(
            id,
            firstname,
            lastname,
            username,
            avatar_url
          )
        `)
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Friends fetch error:", error);
        setFriends([]);
      } else {
        setFriends(data || []);
      }

      setLoadingFriends(false);
    };

    fetchFriends();
  }, [user]);

  // -----------------------------
  // FORMAT FRIENDS (SAFE)
  // -----------------------------
  const formattedFriends = useMemo(() => {
    return (friends || [])
      .map((f) => {
        const isUser1 = f.user_id1 === user?.id;

        const profile = isUser1 ? f.profile2 : f.profile1;

        // 🔥 PROTECTION CRITIQUE
        if (!profile?.id) return null;

        return {
          id: f.id,
          friend_id: profile.id,
          name: `${profile.firstname || ''} ${profile.lastname || ''}`.trim(),
          username: profile.username || '',
          avatar: profile.avatar_url || null,
          created_at: f.created_at
        };
      })
      .filter(Boolean); // supprime null
  }, [friends, user]);

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

              <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                {view === "friends"
                  ? formattedFriends.length
                  : invitations.length}
              </span>
            </div>

            {/* ===================== */}
            {/* INVITATIONS */}
            {/* ===================== */}
            {view === "invitations" && (
              <>
                {invitations.length === 0 ? (
                  <div className="text-center text-gray-500 py-20">
                    Aucune invitation
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                    {invitations.map((inv) => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          if (inv.user_id) {
                            navigate(`/user/${inv.user_id}`);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <FriendRequestCard
                          invitation={inv}
                          onAccept={acceptInvitation}
                          onDecline={declineInvitation}
                        />
                      </div>
                    ))}

                  </div>
                )}
              </>
            )}

            {/* ===================== */}
            {/* FRIENDS */}
            {/* ===================== */}
            {view === "friends" && (
              <>
                {loadingFriends ? (
                  <div className="text-center py-20 text-gray-500">
                    Chargement...
                  </div>
                ) : formattedFriends.length === 0 ? (
                  <div className="text-center text-gray-500 py-20">
                    Aucun ami pour le moment
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                    {formattedFriends.map((friend) => (
                      <div
                        key={friend.id}
                        onClick={() => {
                          if (friend.friend_id) {
                            navigate(`/user/${friend.friend_id}`);
                          }
                        }}
                        className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition cursor-pointer"
                      >

                        <div className="flex items-center gap-3">

                          <img
                            src={
                              friend.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${friend.name}`
                            }
                            className="w-10 h-10 rounded-full object-cover"
                          />

                          <div>
                            <p className="font-semibold text-gray-900 hover:text-blue-600">
                              {friend.name || "Utilisateur"}
                            </p>

                            <p className="text-xs text-gray-500">
                              @{friend.username}
                            </p>
                          </div>

                        </div>

                        <p className="text-xs text-gray-400 mt-3">
                          Ami depuis{" "}
                          {new Date(friend.created_at).toLocaleDateString()}
                        </p>

                      </div>
                    ))}

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