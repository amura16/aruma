import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Edit, MoreHorizontal, Send, Phone, Video, Info, ChevronLeft, Loader2 } from 'lucide-react';
import NavBar from '../components/Layout/Navbar';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import FriendSearchOverlay from '../components/Messages/FriendSearchOverlay';
import supabase from '../services/supabaseClient';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

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

  // ouvrir conversation via URL
  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    if (targetUserId && conversations.length > 0) {
      const existing = conversations.find(c => c.friend_id === targetUserId);

      if (existing) {
        selectConversation(existing.id);
      } else {
        const fetchAndPrepare = async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, firstname, lastname, username, avatar_url')
            .eq('id', targetUserId)
            .single();

          if (profile) prepareNewConversation(profile);
        };

        fetchAndPrepare();
      }
    }
  }, [searchParams, conversations]);

  // auto scroll
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

  const handleSelectFriendFromSearch = (friend) => {
    setIsSearching(false);

    const existing = conversations.find(c => c.friend_id === friend.id);

    if (existing) {
      selectConversation(existing.id);
    } else {
      prepareNewConversation(friend);
    }
  };

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

      {/* MAIN WRAPPER */}
      <div className="flex flex-1 h-full overflow-hidden relative">

        {/* LEFT */}
        <aside className={`${selectedConversation ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-[360px] border-r border-gray-200 bg-white`}>

          {isSearching && (
            <FriendSearchOverlay
              onClose={() => setIsSearching(false)}
              onSelectFriend={handleSelectFriendFromSearch}
            />
          )}

          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Discussions</h1>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 rounded-full">
                  <MoreHorizontal size={20} />
                </button>
                <button onClick={() => setIsSearching(true)} className="p-2 bg-gray-100 rounded-full text-blue-600">
                  <Edit size={20} />
                </button>
              </div>
            </div>

            <div onClick={() => setIsSearching(true)} className="relative mb-4 cursor-pointer">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <div className="w-full bg-gray-100 py-2.5 pl-10 pr-4 rounded-full text-gray-500 text-sm">
                Rechercher un ami...
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-10">
                <Loader2 className="animate-spin" />
              </div>
            ) : conversations.map(c => (
              <div
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className="flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer hover:bg-gray-50"
              >
                <img
                  src={c.display_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.display_name}`}
                  className="w-12 h-12 rounded-full"
                  alt=""
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{c.display_name}</h4>
                  <p className="text-sm text-gray-500 truncate">
                    {c.last_message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT */}
        <main className={`${selectedConversation ? 'flex' : 'hidden'} md:flex flex-col flex-1 h-full bg-white`}>

          {selectedConversation ? (
            <>
              {/* HEADER */}
              <header className="flex justify-between items-center p-3 border-b bg-white">
                <div className="flex items-center gap-3">
                  <button onClick={() => selectConversation(null)} className="md:hidden">
                    <ChevronLeft size={24} />
                  </button>

                  <img
                    src={selectedConversation.display_avatar}
                    className="w-10 h-10 rounded-full"
                    alt=""
                  />

                  <div>
                    <h3 className="font-bold">{selectedConversation.display_name}</h3>
                    <p className="text-xs text-green-500">En ligne</p>
                  </div>
                </div>

                <div className="flex gap-3 text-blue-600">
                  <Phone size={20} />
                  <Video size={20} />
                  <Info size={20} />
                </div>
              </header>

              {/* MESSAGES SCROLL AREA */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl ${m.sender_id === user.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border'
                        }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* INPUT FIXED BY FLEX */}
              <footer className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Aa"
                    className="flex-1 bg-gray-100 px-4 py-2 rounded-full"
                  />

                  <button
                    type="submit"
                    disabled={!msgText.trim()}
                    className="bg-blue-600 text-white p-2 rounded-full"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
              Sélectionnez une discussion
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;