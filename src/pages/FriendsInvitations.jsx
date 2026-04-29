import React from 'react';
import NavBar from '../components/Layout/Navbar';
import InvitationsSidebar from '../components/Invitations/InvitationsSidebar';
import FriendRequestCard from '../components/Invitations/FriendRequestCard';
import { useFriends } from '../hooks/useFriends';

const FriendsInvitations = () => {
  const { invitations, acceptInvitation, declineInvitation } = useFriends();

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />
      
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-112px)]">
        {/* Navigation Gauche */}
        <InvitationsSidebar />

        {/* Contenu Droite */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Invitations</h3>
              <button className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-medium">
                Voir tout
              </button>
            </div>

            {/* Grille Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {invitations.map((inv) => (
                <FriendRequestCard 
                  key={inv.id}
                  name={inv.name}
                  mutualFriends={inv.mutualFriends}
                  avatar={inv.avatar}
                  onAccept={() => acceptInvitation(inv.id)}
                  onDecline={() => declineInvitation(inv.id)}
                />
              ))}
            </div>

            {invitations.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">Aucune invitation en attente.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FriendsInvitations;