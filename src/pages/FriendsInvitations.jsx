import React from 'react';
import NavBar from '../components/Layout/Navbar';
import InvitationsSidebar from '../components/Invitations/InvitationsSidebar';
import FriendRequestCard from '../components/Invitations/FriendRequestCard';
import { useFriendContext } from '../context/FriendContext'; // Utilisation du Context

const FriendsInvitations = () => {
  // On récupère les données et les fonctions depuis le Context
  const { invitations, acceptInvitation, declineInvitation, loading } = useFriendContext();

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Barre de navigation supérieure */}
      <NavBar />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-112px)]">
        {/* Navigation Gauche (Sidebar) */}
        <InvitationsSidebar />

        {/* Contenu Principal à Droite */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Invitations</h3>
              <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full font-medium">
                {invitations.length} en attente
              </span>
            </div>

            {/* État de chargement */}
            {loading && invitations.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-72 bg-gray-200 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : (
              <>
                {/* Grille des invitations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {invitations.map((inv) => (
                    <FriendRequestCard
                      key={inv.id}
                      invitation={inv} // On passe l'objet invitation complet
                      onAccept={acceptInvitation}
                      onDecline={declineInvitation}
                    />
                  ))}
                </div>

                {/* État vide */}
                {invitations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Aucune invitation en attente pour le moment.</p>
                    <p className="text-sm text-gray-400">Les nouvelles demandes apparaîtront ici.</p>
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