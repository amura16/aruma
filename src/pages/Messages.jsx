import React, { useState } from 'react';
import { Search, Edit, MoreHorizontal, Send, Phone, Video, Info, ChevronLeft } from 'lucide-react';
import NavBar from '../components/Layout/Navbar';
import SearchBar from '../components/UI/searchBar';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const contacts = [
    { id: 1, name: "Inès Bella", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ines", lastMsg: "Tu as vu le dernier post ?", time: "14:20", online: true },
    { id: 2, name: "Thomas Durant", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas", lastMsg: "Ok, à demain !", time: "Hier", online: true },
    { id: 3, name: "Julie Rose", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julie", lastMsg: "Merci beaucoup !", time: "Lun", online: false },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      <NavBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* --- LISTE DES CONVERSATIONS --- */}
        <aside className={`${selectedChat ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-[360px] border-r border-gray-200`}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Discussions</h1>
              <div className="flex gap-2">
                <div className="p-2 bg-gray-100 rounded-full cursor-pointer"><MoreHorizontal size={20}/></div>
                <div className="p-2 bg-gray-100 rounded-full cursor-pointer"><Edit size={20}/></div>
              </div>
            </div>
            
            {/* Barre de recherche */}
            <SearchBar 
              placeholder="Rechercher dans Messenger" 
              className="mb-4" 
            />

            {/* Avatars en cercles (Utilisateurs en ligne) */}
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {contacts.filter(c => c.online).map(c => (
                <div key={c.id} className="flex flex-col items-center gap-1 min-w-[65px] cursor-pointer">
                  <div className="relative">
                    <img src={c.avatar} className="w-14 h-14 rounded-full border border-gray-200 p-0.5" alt={c.name} />
                    <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <span className="text-[11px] text-gray-600 truncate w-full text-center">{c.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {contacts.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedChat(c)}
                className="flex items-center gap-3 p-3 mx-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                <div className="relative shrink-0">
                  <img src={c.avatar} className="w-14 h-14 rounded-full" alt={c.name} />
                  {c.online && <div className="absolute bottom-1 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[15px]">{c.name}</h4>
                  <p className="text-sm text-gray-500 truncate">{c.lastMsg} · {c.time}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* --- ZONE DE CHAT --- */}
        <main className={`${selectedChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white`}>
          {selectedChat ? (
            <>
              {/* Header du Chat */}
              <header className="flex justify-between items-center p-3 border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="relative">
                    <img src={selectedChat.avatar} className="w-10 h-10 rounded-full" alt="" />
                    {selectedChat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px]">{selectedChat.name}</h3>
                    <p className="text-[11px] text-gray-500">{selectedChat.online ? 'En ligne' : 'Hors ligne'}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-blue-600">
                  <Phone className="cursor-pointer" size={20} />
                  <Video className="cursor-pointer" size={20} />
                  <Info className="cursor-pointer" size={20} />
                </div>
              </header>

              {/* Messages personnels */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                <div className="self-start max-w-[70%] bg-gray-100 p-3 rounded-2xl rounded-bl-none text-[15px]">
                  Salut ! Tu as pu avancer sur le projet ArumA ?
                </div>
                <div className="self-end max-w-[70%] bg-blue-600 text-white p-3 rounded-2xl rounded-br-none text-[15px]">
                  Oui, je viens de finir la structure des messages. C'est responsive ! 🚀
                </div>
                <div className="self-start max-w-[70%] bg-gray-100 p-3 rounded-2xl rounded-bl-none text-[15px]">
                  Top ! Je vais tester ça tout de suite.
                </div>
              </div>

              {/* Input Message */}
              <footer className="p-4 flex items-center gap-3">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Aa" 
                    className="w-full bg-gray-100 py-2.5 px-4 rounded-full focus:outline-none"
                  />
                </div>
                <button className="text-blue-600 hover:scale-110 transition-transform">
                  <Send size={24} />
                </button>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Edit size={32} />
              </div>
              <h2 className="text-xl font-bold text-black">Sélectionnez une discussion</h2>
              <p className="max-w-[250px]">Choisissez un contact pour commencer à discuter sur ArumA.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;