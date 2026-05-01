import React, { useState, useEffect, useRef } from 'react';
import { Search, Edit, MoreHorizontal, Send, Phone, Video, Info, ChevronLeft, Loader2 } from 'lucide-react';
import NavBar from '../components/Layout/Navbar';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import FriendSearchOverlay from '../components/Messages/FriendSearchOverlay';

const Messages = () => {
  const {
    conversations,
    selectedConversation,
    messages,
    selectConversation,
    sendMessage,
    startNewConversation,
    loading
  } = useChat();

  const { user } = useAuth();
  const [msgText, setMsgText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    sendMessage(msgText);
    setMsgText("");
  };

  const handleSelectFriendFromSearch = async (friend) => {
    setIsSearching(false);
    // On vérifie si une conversation existe déjà localement avec cet ami
    const existing = conversations.find(c => c.friend_id === friend.id);

    if (existing) {
      selectConversation(existing.id);
    } else {
      // Sinon on initialise la création en base de données
      await startNewConversation(friend.id);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <NavBar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* --- BARRE LATÉRALE GAUCHE --- */}
        <aside className={`${selectedConversation ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-[360px] border-r border-gray-200 relative bg-white`}>

          {/* Layout de recherche d'amis (Overlay) */}
          {isSearching && (
            <FriendSearchOverlay
              onClose={() => setIsSearching(false)}
              onSelectFriend={handleSelectFriendFromSearch}
            />
          )}

          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold tracking-tight">Discussions</h1>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <MoreHorizontal size={20} />
                </button>
                <button
                  onClick={() => setIsSearching(true)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-blue-600"
                >
                  <Edit size={20} />
                </button>
              </div>
            </div>

            {/* Barre de recherche (Trigger pour l'overlay) */}
            <div
              onClick={() => setIsSearching(true)}
              className="relative mb-4 cursor-pointer group"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" size={18} />
              <div className="w-full bg-gray-100 py-2.5 pl-10 pr-4 rounded-full text-gray-500 text-sm border border-transparent group-hover:border-gray-200">
                Rechercher un ami...
              </div>
            </div>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading && conversations.length === 0 ? (
              <div className="flex justify-center p-10 text-gray-400"><Loader2 className="animate-spin" /></div>
            ) : conversations.length > 0 ? (
              conversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-all ${selectedConversation?.id === c.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.display_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.display_name}`}
                      className="w-14 h-14 rounded-full object-cover border border-gray-100"
                      alt=""
                    />
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-[15px] text-gray-900 truncate">{c.display_name}</h4>
                      <span className="text-[10px] text-gray-400">12:45</span>
                    </div>
                    <p className={`text-sm truncate ${selectedConversation?.id === c.id ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {c.last_message || "Démarrer une discussion"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400 text-sm">Aucune discussion. Cliquez sur l'icône d'édition pour commencer.</div>
            )}
          </div>
        </aside>

        {/* --- ZONE DE CHAT PRINCIPALE --- */}
        <main className={`${selectedConversation ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white`}>
          {selectedConversation ? (
            <>
              {/* Header du Chat */}
              <header className="flex justify-between items-center p-3 border-b border-gray-100 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => selectConversation(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="relative">
                    <img
                      src={selectedConversation.display_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation.display_name}`}
                      className="w-10 h-10 rounded-full object-cover"
                      alt=""
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] leading-tight">{selectedConversation.display_name}</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-[11px] text-gray-500 font-medium">Actif maintenant</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 md:gap-4 text-blue-600 pr-2">
                  <button className="p-2 hover:bg-blue-50 rounded-full"><Phone size={20} /></button>
                  <button className="p-2 hover:bg-blue-50 rounded-full"><Video size={20} /></button>
                  <button className="p-2 hover:bg-blue-50 rounded-full"><Info size={20} /></button>
                </div>
              </header>

              {/* Zone des Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f2f5]/30 custom-scrollbar"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl text-[15px] shadow-sm ${m.sender_id === user.id
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}
                    >
                      {m.text}
                      <p className={`text-[10px] mt-1 opacity-70 text-right`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Footer */}
              <footer className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                  <input
                    type="text"
                    placeholder="Ecrivez votre message..."
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    className="flex-1 bg-gray-100 py-2.5 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!msgText.trim()}
                    className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </footer>
            </>
          ) : (
            /* État Vide (Desktop) */
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Edit size={40} className="text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Vos messages</h2>
              <p className="max-w-xs text-center text-sm">
                Sélectionnez une discussion existante ou recherchez un ami pour commencer à chatter.
              </p>
              <button
                onClick={() => setIsSearching(true)}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Nouveau message
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;