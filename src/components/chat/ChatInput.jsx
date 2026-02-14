import React, { useState } from 'react';
import { Send, Smile, Mic } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ChatInput({ onSend, isLoading }) {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-3 bg-[#1a1a1a] border-t border-white/5">
      <div className="flex items-center gap-2">
        <button type="button" className="p-2 text-gray-400 hover:text-gray-300 transition-colors">
          <Smile className="w-6 h-6" />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nachricht schreiben..."
            className="w-full bg-[#262626] text-white rounded-full px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-500"
            disabled={isLoading}
          />
        </div>
        
        {message.trim() ? (
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading}
            className="h-11 w-11 rounded-full bg-emerald-600 hover:bg-emerald-500 transition-all"
          >
            <Send className="w-5 h-5" />
          </Button>
        ) : (
          <button type="button" className="p-2 text-gray-400 hover:text-gray-300 transition-colors">
            <Mic className="w-6 h-6" />
          </button>
        )}
      </div>
    </form>
  );
}