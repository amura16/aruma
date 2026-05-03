import React from 'react';
const ConversationItem = ({ conversation, isActive, onClick }) => {
  const { friend, lastMessage, unreadCount, updatedAt } = conversation;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formattedTime = formatDate(updatedAt);

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 mx-2 rounded-2xl cursor-pointer transition-all duration-200 group ${
        isActive 
          ? 'bg-blue-50 border border-blue-100 shadow-sm' 
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <div className="relative">
        <img
          src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          alt={friend.firstname}
        />
        {friend.is_online && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h4 className={`font-bold truncate text-[15px] ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
            {friend.firstname} {friend.lastname}
          </h4>
          <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">
            {formattedTime}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
            {lastMessage.text}
          </p>
          
          {unreadCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-sm">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
