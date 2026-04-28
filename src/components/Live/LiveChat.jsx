import React from 'react';
import { Send, Smile, Gift } from 'lucide-react';

const LiveChat = () => {
  const messages = [
    { id: 1, user: "Mialy", text: "Incroyable ce live ! 🔥", color: "text-pink-500" },
    { id: 2, user: "Lucas", text: "Est-ce que tu peux montrer le setup ?", color: "text-blue-500" },
    { id: 3, user: "Admin", text: "Bienvenue tout le monde, n'oubliez pas de partager !", color: "text-red-500" },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-full lg:w-[350px]">
      <div className="p-4 border-b border-gray-100 shadow-sm">
        <h3 className="font-bold text-lg">Chat en direct</h3>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2 items-start text-[14px]">
            <span className={`font-bold shrink-0 ${msg.color}`}>{msg.user} :</span>
            <span className="text-gray-800 break-words">{msg.text}</span>
          </div>
        ))}
      </div>

      {/* Input de message */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <input 
            type="text" 
            placeholder="Chatter..." 
            className="bg-transparent flex-1 outline-none text-sm"
          />
          <Smile size={20} className="text-gray-500 cursor-pointer" />
          <Send size={20} className="text-blue-600 cursor-pointer" />
        </div>
        <div className="flex justify-between mt-3 px-2">
          <button className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-orange-500">
            <Gift size={16} /> Envoyer un cadeau
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;