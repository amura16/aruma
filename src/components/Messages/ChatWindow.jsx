import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, Info, ChevronLeft, Loader2, Smile, Paperclip, MoreVertical } from 'lucide-react';

const ChatWindow = ({ 
  conversation, 
  messages, 
  loading, 
  onBack, 
  onSendMessage,
  currentUserId
}) => {
  const [msgText, setMsgText] = useState('');
  const scrollRef = useRef(null);

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    onSendMessage(msgText);
    setMsgText('');
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-10">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-200">
            <Send className="text-white" size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Vos messages</h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          Sélectionnez une discussion ou commencez-en une nouvelle pour échanger avec vos amis.
        </p>
      </div>
    );
  }

  const { friend } = conversation;

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="relative">
            <img
              src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
              alt={friend.firstname}
            />
            {friend.is_online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>

          <div>
            <h3 className="font-bold text-gray-900 leading-tight">
              {friend.firstname} {friend.lastname}
            </h3>
            <p className="text-[11px] font-medium text-blue-600 uppercase tracking-wider">
              {friend.is_online ? 'En ligne' : 'Hors ligne'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90">
            <Phone size={20} />
          </button>
          <button className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90">
            <Video size={20} />
          </button>
          <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-all active:scale-90">
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-2 bg-[#f8faff] custom-scrollbar"
      >
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : (
          messages.map((m) => {
            const isOwn = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-4`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all duration-200 ${
                    isOwn
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {formatTime(m.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <footer className="p-5 border-t border-gray-100 bg-white">
        <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-5xl mx-auto">
          <div className="flex gap-1 mb-1">
            <button type="button" className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
              <Paperclip size={20} />
            </button>
            <button type="button" className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
              <Smile size={20} />
            </button>
          </div>
          
          <div className="flex-1 relative">
            <textarea
              rows="1"
              value={msgText}
              onChange={(e) => {
                setMsgText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Écrivez votre message..."
              className="w-full bg-gray-50 border-none px-5 py-3.5 rounded-2xl text-[15px] focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none max-h-32 placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!msgText.trim()}
            className="mb-1 p-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-2xl transition-all duration-200 shadow-lg shadow-blue-100 active:scale-95"
          >
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
