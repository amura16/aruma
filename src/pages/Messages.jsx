import React, { useState, useEffect, useRef } from 'react';
import { Search, Edit, MoreHorizontal, Send, Phone, Video, Info, ChevronLeft, Loader2 } from 'lucide-react';
import NavBar from '../components/Layout/Navbar';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import FriendSearchOverlay from '../components/Messages/FriendSearchOverlay';

const Messages = () => {
  // --- 1. TOUS LES HOOKS (DOIVENT ÊTRE AU SOMMET) ---
  const { user } = useAuth();
  const {
    conversations,
    selectedConversation,
    messages,
    selectConversation,
    prepareNewConversation,
    sendMessage,
    loading
  } = useChat();

  const [msgText, setMsgText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const scrollRef = useRef(null);

  // Scroll automatique vers le bas à chaque nouveau message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- 2. LOGIQUE MÉTIER ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    sendMessage(msgText);
    setMsgText("");
  };

  const handleSelectFriendFromSearch = (friend) => {
    setIsSearching(false);
    // Vérifier si une discussion réelle existe déjà dans la liste
    const existing = conversations.find(c => c.friend_id === friend.id);

    if (existing) {
      selectConversation(existing.id);
    } else {
      // Ouvre immédiatement l'interface de chat à droite (mode temporaire)
      prepareNewConversation(friend);
    }
  };

  // --- 3. RETOURS CONDITIONNELS (APRÈS LES HOOKS) ---
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <NavBar />

      <div className="flex flex-1 overflow-hidden relative">

        {/* --- COLONNE GAUCHE : LISTE DES DISCUSSIONS --- */}
        <aside className={`${selectedConversation ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-[360px] border-r border-gray-200 bg-white`}>

          {/* Overlay de recherche d'amis */}
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

            {/* Déclencheur de recherche */}
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
              <div className="flex justify-center p-10 text-gray-400">
                <Loader2 className="animate-spin" />
              </div>
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
                      className="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-sm"
                      alt={c.display_name}
                    />
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-[15px] text-gray-900 truncate">{c.display_name}</h4>
                    </div>
                    <p className={`text-sm truncate ${selectedConversation?.id === c.id ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {c.last_message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400 text-sm italic">
                Aucune discussion active. Commencez par rechercher un ami !
              </div>
            )}
          </div>
        </aside>

        {/* --- COLONNE DROITE : FENÊTRE DE CHAT --- */}
        <main className={`${selectedConversation ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white`}>
          {selectedConversation ? (
            <>
              {/* Header du Chat */}
              <header className="flex justify-between items-center p-3 border-b border-gray-100 shadow-sm z-10 bg-white">
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
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                      alt=""
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] leading-tight">{selectedConversation.display_name}</h3>
                    <p className="text-[11px] text-green-500 font-medium">En ligne</p>
                  </div>
                </div>
                <div className="flex gap-2 md:gap-4 text-blue-600">
                  <button className="p-2 hover:bg-blue-50 rounded-full transition-colors"><Phone size={20} /></button>
                  <button className="p-2 hover:bg-blue-50 rounded-full transition-colors"><Video size={20} /></button>
                  <button className="p-2 hover:bg-blue-50 rounded-full transition-colors"><Info size={20} /></button>
                </div>
              </header>

              {/* Zone des Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fa] custom-scrollbar"
              >
                {messages.length > 0 ? (
                  messages.map((m) => (
                    <div
                      key={m.id || Math.random()}
                      className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-[15px] shadow-sm ${m.sender_id === user.id
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                          }`}
                      >
                        {m.text}
                        <p className={`text-[9px] mt-1 opacity-70 text-right font-bold uppercase`}>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Envoi..."}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  /* État quand la discussion est vide */
                  <div className="flex flex-col items-center justify-center h-full text-center p-10">
                    <img
                      src={selectedConversation.display_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation.display_name}`}
                      className="w-20 h-20 rounded-full mb-4 opacity-50 grayscale"
                      alt=""
                    />
                    <h4 className="font-bold text-gray-900">Nouvelle discussion avec {selectedConversation.display_name}</h4>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Envoyez votre premier message pour créer la conversation !
                    </p>
                  </div>
                )}
              </div>

              {/* Barre de saisie */}
              <footer className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                  <input
                    type="text"
                    placeholder="Aa"
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    className="flex-1 bg-gray-100 py-2.5 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!msgText.trim()}
                    className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </footer>
            </>
          ) : (
            /* État vide (Bureau) */
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <Edit size={40} className="text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sélectionnez une discussion</h2>
              <p className="max-w-xs text-center text-sm">
                Choisissez un ami à gauche ou lancez un nouveau message.
              </p>
              <button
                onClick={() => setIsSearching(true)}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg"
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