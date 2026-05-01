import React from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../services/supabaseClient';

const FriendRequestCard = ({ invitation, onRefresh }) => {
  const navigate = useNavigate();

  // ----------------------------
  // 🔥 NORMALISATION DATA
  // ----------------------------
  const id = invitation.id;

  const sender_id =
    invitation.sender_id ||
    invitation.user_id ||
    invitation.from_user_id;

  const receiver_id =
    invitation.receiver_id ||
    invitation.to_user_id;

  const name =
    invitation.name ||
    invitation.sender_name ||
    invitation.user?.firstname ||
    invitation.profile?.firstname ||
    "Utilisateur";

  const avatar =
    invitation.avatar ||
    invitation.sender_avatar ||
    invitation.user?.avatar_url ||
    invitation.profile?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;

  const created_at = invitation.created_at;

  // ----------------------------
  // 👤 GO PROFILE
  // ----------------------------
  const goToProfile = (e) => {
    e.stopPropagation();
    if (!sender_id) return;
    navigate(`/user/${sender_id}`);
  };

  // ----------------------------
  // ✔ ACCEPT INVITATION
  // ----------------------------
  const handleAccept = async (e) => {
    e.stopPropagation();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      const currentUserId = user.id;

      const sender = sender_id;
      const receiver = receiver_id || currentUserId;

      if (!sender || !receiver) return;

      // 🧠 normalisation A < B
      const user_id1 = sender < receiver ? sender : receiver;
      const user_id2 = sender < receiver ? receiver : sender;

      // ----------------------------
      // INSERT FRIENDS
      // ----------------------------
      const { error: err1 } = await supabase
        .from('friends')
        .insert({
          user_id1,
          user_id2
        });

      if (err1) throw err1;

      // ----------------------------
      // DELETE INVITATION
      // ----------------------------
      const { error: err2 } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);

      if (err2) throw err2;

      onRefresh?.();

    } catch (err) {
      console.error("Accept error:", err.message);
    }
  };

  // ----------------------------
  // ❌ DECLINE INVITATION
  // ----------------------------
  const handleDecline = async (e) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      onRefresh?.();

    } catch (err) {
      console.error("Decline error:", err.message);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      {/* AVATAR */}
      <img
        src={avatar}
        alt={name}
        className="w-full h-48 object-cover bg-gray-100 cursor-pointer"
        onClick={goToProfile}
      />

      <div className="p-4">

        {/* NAME */}
        <h4
          onClick={goToProfile}
          className="font-bold text-[17px] truncate cursor-pointer hover:text-blue-600"
        >
          {name}
        </h4>

        {/* DATE */}
        <p className="text-xs text-gray-500 mt-1">
          {created_at ? new Date(created_at).toLocaleString() : ""}
        </p>

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 mt-3">

          <button
            onClick={handleAccept}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition active:scale-[0.98]"
          >
            Confirmer
          </button>

          <button
            onClick={handleDecline}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 rounded-lg transition active:scale-[0.98]"
          >
            Supprimer
          </button>

        </div>

      </div>
    </div>
  );
};

export default FriendRequestCard;