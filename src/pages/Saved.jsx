import React from 'react';
import NavBar from '../components/Layout/Navbar';
import SavedSidebar from '../components/Saved/SavedSidebar';
import SavedItem from '../components/Saved/SavedItem';

const Saved = () => {
  const savedData = [
    {
      id: 1,
      title: "Comment optimiser votre flux React en 2026",
      author: "ArumA Tech",
      category: "Article",
      image: "https://picsum.photos/400/300?random=1",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech"
    },
    {
      id: 2,
      title: "Les plus beaux paysages d'Antananarivo vus du ciel",
      author: "Mada Discovery",
      category: "Vidéo",
      image: "https://picsum.photos/400/300?random=2",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mada"
    },
    {
      id: 3,
      title: "Recette traditionnelle malgache : Le Romazava",
      author: "Chef Julie",
      category: "Post",
      image: "https://picsum.photos/400/300?random=3",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julie"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />
      
      <div className="flex h-[calc(100vh-112px)] overflow-hidden">
        {/* Sidebar fixe */}
        <SavedSidebar />

        {/* Liste défilante */}
        <main className="flex-1 overflow-y-auto pt-6 px-4 custom-scrollbar">
          <div className="max-w-[800px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Tous les éléments</h3>
              <button className="text-purple-600 font-medium hover:bg-purple-50 px-3 py-1.5 rounded-lg transition">
                Créer une collection
              </button>
            </div>

            <div className="space-y-3 pb-10">
              {savedData.map((item) => (
                <SavedItem 
                  key={item.id}
                  title={item.title}
                  author={item.author}
                  category={item.category}
                  image={item.image}
                  avatar={item.avatar}
                />
              ))}
            </div>

            {savedData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Bookmark size={60} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Aucun élément enregistré pour le moment.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Saved;