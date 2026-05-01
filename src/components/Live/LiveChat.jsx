import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Gift, Loader2 } from 'lucide-react';
import supabase from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const LiveChat = ({ roomName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!roomName) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('live_messages')
          .select(`
            *,
            user:profiles!user_id (firstname, lastname, avatar_url)
          `)
          .eq('room_name', roomName)
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error("Erreur chargement chat:", err);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchMessages();

    // Abonnement temps réel
    const channel = supabase
      .channel(`live_chat_${roomName}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_messages',
        filter: `room_name=eq.${roomName}`
      }, async (payload) => {
        // Pour avoir les infos de l'utilisateur qui vient de poster
        const { data: userData } = await supabase
          .from('profiles')
          .select('firstname, lastname, avatar_url')
          .eq('id', payload.new.user_id)
          .single();

        const fullMessage = {
          ...payload.new,
          user: userData
        };

        setMessages(prev => [...prev, fullMessage]);
        setTimeout(scrollToBottom, 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomName]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !roomName) return;

    const msgToSend = newMessage;
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('live_messages')
        .insert([{
          room_name: roomName,
          user_id: user.id,
          text: msgToSend
        }]);

      if (error) throw error;
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-full lg:w-full overflow-hidden shadow-inner">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          Chat en direct
        </h3>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">
          Temps Réel
        </span>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#f8f9fa]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-gray-400 text-sm">Chargement du chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send size={20} />
            </div>
            <p className="text-gray-500 text-sm font-medium">Bienvenue sur le chat !</p>
            <p className="text-gray-400 text-xs mt-1">Dites bonjour à tout le monde 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className={`font-extrabold text-[13px] ${msg.user_id === user?.id ? 'text-blue-600' : 'text-gray-700'}`}>
                    {msg.user?.firstname || 'Anonyme'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="mt-0.5 bg-white p-2 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm inline-block max-w-full self-start">
                  <p className="text-gray-800 text-[14px] leading-relaxed break-words">{msg.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de message */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <form onSubmit={handleSendMessage} className="relative">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              placeholder={user ? "Écrivez un message..." : "Connectez-vous pour chatter"}
              disabled={!user}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="bg-transparent flex-1 outline-none text-sm disabled:cursor-not-allowed"
            />
            <div className="flex items-center gap-2">
              <Smile size={18} className="text-gray-400 hover:text-blue-500 cursor-pointer transition" />
              <button
                type="submit"
                disabled={!user || !newMessage.trim()}
                className={`p-1.5 rounded-full transition ${!user || !newMessage.trim() ? 'text-gray-300' : 'text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'}`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </form>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Restez respectueux dans vos messages.
        </p>
      </div>
    </div>
  );
};

export default LiveChat;