import React from 'react';
import NavBar from '../components/Layout/Navbar';
import VideoSidebar from '../components/Video/VideoSidebar';
import VideoCard from '../components/Video/VideoCard';

const VideoFeed = () => {
  const videoData = [
    {
      id: 1,
      author: { name: "ArumA Tech", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech" },
      title: "Découvrez le futur du développement avec ArumA 🚀",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      time: "Il y a 2 heures",
      views: "12k"
    },
    {
      id: 2,
      author: { name: "Voyage Madagascar", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Travel" },
      title: "Les plus belles plages de l'île Rouge 🏖️",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      time: "Il y a 5 heures",
      views: "45k"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavBar />
      
      <div className="flex h-[calc(100vh-112px)] overflow-hidden">
        {/* Sidebar fixe à gauche */}
        <VideoSidebar />

        {/* Flux de vidéos défilant au centre */}
        <main className="flex-1 overflow-y-auto pt-4 px-4 custom-scrollbar">
          <div className="max-w-[700px] mx-auto">
            {videoData.map((video) => (
              <VideoCard 
                key={video.id}
                author={video.author}
                title={video.title}
                videoUrl={video.videoUrl}
                time={video.time}
                views={video.views}
              />
            ))}

            {/* Spinner de chargement infini (factice) */}
            <div className="py-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VideoFeed;