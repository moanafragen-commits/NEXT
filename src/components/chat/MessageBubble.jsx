import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message, characterAvatar, characterName }) {
  const isUser = message.role === 'user';
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${characterName}`;
  
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <img 
          src={characterAvatar || defaultAvatar}
          alt={characterName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
        />
      )}
      
      <div className={`max-w-[75%] ${isUser ? 'order-1' : ''}`}>
        <div 
          className={`rounded-2xl px-4 py-2.5 ${
            isUser 
              ? 'bg-emerald-600 text-white rounded-br-md' 
              : 'bg-[#262626] text-gray-100 rounded-bl-md'
          }`}
        >
          <ReactMarkdown className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {message.content}
          </ReactMarkdown>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-gray-500">
            {format(new Date(message.created_date), 'HH:mm', { locale: de })}
          </span>
          {isUser && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
        </div>
      </div>
    </div>
  );
}