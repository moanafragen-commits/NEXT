import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function CharacterCard({ character, lastMessage, onClick }) {
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
  
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-all duration-200 border-b border-white/5"
    >
      <div className="relative">
        <img 
          src={character.avatar_url || defaultAvatar}
          alt={character.name}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/20"
        />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#111]" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="font-semibold text-white truncate">{character.name}</h3>
          {lastMessage && (
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {format(new Date(lastMessage.created_date), 'HH:mm', { locale: de })}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 truncate mt-0.5">
          {lastMessage?.content || character.status || character.greeting || character.personality?.slice(0, 50) + '...'}
        </p>
      </div>
    </div>
  );
}