import React from 'react';
import NavBar from '../components/Layout/Navbar';
import InvitationsSidebar from '../components/Invitations/InvitationsSidebar';
import FriendRequestCard from '../components/Invitations/FriendRequestCard';

const FriendsInvitations = () => {
  // Simulation de données reçues de Supabase
  const requests = [
    { id: 1, name: "Sonia Rakoto", mutualFriends: 12, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia" },
    { id: 2, name: "Jean Marc", mutualFriends: 3, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marc" },
    { id: 3, name: "Mialy Soa", mutualFriends: 0, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mialy" },
    { id: 4, name: "Lucas Randria", mutualFriends: 8, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas" },
  ];

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
              {requests.map((request) => (
                <FriendRequestCard 
                  key={request.id}
                  name={request.name}
                  mutualFriends={request.mutualFriends}
                  avatar={request.avatar}
                  onAccept={() => console.log("Accepté", request.id)}
                  onDecline={() => console.log("Refusé", request.id)}
                />
              ))}
            </div>

            {requests.length === 0 && (
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