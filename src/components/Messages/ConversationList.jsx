import React, { useState } from 'react';
import { Search, Edit, MoreHorizontal, Loader2 } from 'lucide-react';
import ConversationItem from './ConversationItem';

const ConversationList = ({ 
  conversations, 
  loading, 
  activeId, 
  onSelect, 
  onNewChat 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(c => 
    `${c.friend.firstname} ${c.friend.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-full md:w-[380px]">
      {/* Header */}
      <div className="p-5 pb-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Discussions</h1>
          <div className="flex gap-2">
            <button className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors duration-200">
              <MoreHorizontal size={20} />
            </button>
            <button 
              onClick={onNewChat}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-blue-200 active:scale-95"
            >
              <Edit size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
          <input
            type="text"
            placeholder="Rechercher un message ou un ami..."
            className="w-full bg-gray-50 border-none py-3.5 pl-11 pr-4 rounded-2xl text-[15px] focus:ring-2 focus:ring-blue-100 transition-all duration-200 placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pt-4 pb-10 space-y-1 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-10 space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm text-gray-500 font-medium">Chargement des discussions...</p>
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map(conv => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={activeId === conv.id}
              onClick={() => onSelect(conv)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center space-y-3">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <Search className="text-gray-300" size={30} />
            </div>
            <div>
              <p className="text-gray-900 font-bold">Aucun résultat</p>
              <p className="text-sm text-gray-500 max-w-[200px] mx-auto mt-1">
                Nous n'avons trouvé aucune discussion correspondant à votre recherche.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
