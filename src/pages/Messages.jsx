import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import NavBar from '../components/Layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { useChatContext } from '../context/ChatContext';
import ConversationList from '../components/Messages/ConversationList';
import ChatWindow from '../components/Messages/ChatWindow';
import FriendSearchOverlay from '../components/Messages/FriendSearchOverlay';
import supabase from '../services/supabaseClient';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  const [tempConversation, setTempConversation] = useState(null);

  const { 
    conversations, 
    selectedConversation, 
    messages, 
    setSelectedConvId, 
    sendMessage, 
    loading,
    refreshConversations 
  } = useChatContext();

  // Handle URL search params (e.g., ?userId=...)
  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    if (targetUserId && conversations.length > 0 && user) {
      const existing = conversations.find(c => c.friend.id === targetUserId);

      if (existing) {
        setSelectedConvId(existing.id);
        setTempConversation(null);
      } else {
        const fetchAndPrepare = async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, firstname, lastname, username, avatar_url, is_online')
            .eq('id', targetUserId)
            .single();

          if (profile) {
            const temp = {
              id: `temp-${profile.id}`,
              friend: profile,
              lastMessage: { text: '' },
              unreadCount: 0,
              updatedAt: new Date().toISOString(),
              isTemporary: true
            };
            setTempConversation(temp);
            setSelectedConvId(temp.id);
          }
        };

        fetchAndPrepare();
      }
      
      // Clear params
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('userId');
      setSearchParams(newParams);
    }
  }, [searchParams, conversations, user, setSearchParams, setSelectedConvId]);

  const handleSelectConversation = (conv) => {
    setTempConversation(null);
    setSelectedConvId(conv.id);
  };

  const handleSendMessage = async (text) => {
    await sendMessage(text);
    if (tempConversation) {
      setTempConversation(null);
    }
  };

  const handleSelectFriendFromSearch = (friend) => {
    setIsSearching(false);
    const existing = conversations.find(c => c.friend.id === friend.id);

    if (existing) {
      setSelectedConvId(existing.id);
      setTempConversation(null);
    } else {
      const temp = {
        id: `temp-${friend.id}`,
        friend: friend,
        lastMessage: { text: '' },
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        isTemporary: true
      };
      setTempConversation(temp);
      setSelectedConvId(temp.id);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Display either the real selected conversation or the temporary one
  const displayConversation = tempConversation || selectedConversation;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <NavBar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar / Conversation List */}
        <div className={`${displayConversation ? 'hidden md:block' : 'block'} w-full md:w-auto h-full`}>
          <ConversationList
            conversations={conversations}
            loading={loading && conversations.length === 0}
            activeId={displayConversation?.id}
            onSelect={handleSelectConversation}
            onNewChat={() => setIsSearching(true)}
          />
        </div>

        {/* Chat Area */}
        <div className={`${displayConversation ? 'block' : 'hidden md:block'} flex-1 h-full`}>
          <ChatWindow
            conversation={displayConversation}
            messages={messages}
            loading={loading && messages.length === 0}
            currentUserId={user.id}
            onBack={() => {
              setSelectedConvId(null);
              setTempConversation(null);
            }}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Search Overlay */}
        {isSearching && (
          <FriendSearchOverlay
            onClose={() => setIsSearching(false)}
            onSelectFriend={handleSelectFriendFromSearch}
          />
        )}
      </div>
    </div>
  );
};

export default Messages;