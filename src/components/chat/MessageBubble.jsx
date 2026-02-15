import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, CheckCheck, Pin, Reply, MoreVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MessageBubble({ message, characterAvatar, characterName, onPin, onReply, replyToMessage }) {
  const isUser = message.role === 'user';
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${characterName}`;
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div 
      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isUser && (
        <img 
          src={characterAvatar || defaultAvatar}
          alt={characterName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
        />
      )}
      
      <div className={`max-w-[75%] ${isUser ? 'order-1' : ''}`}>
        {message.is_pinned && (
          <div className="flex items-center gap-1 mb-1 text-xs text-emerald-400">
            <Pin className="w-3 h-3" />
            <span>Gepinnt</span>
          </div>
        )}
        
        <div 
          className={`rounded-2xl px-4 py-2.5 relative ${
            isUser 
              ? 'bg-emerald-600 text-white rounded-br-md' 
              : 'bg-[#262626] text-gray-100 rounded-bl-md'
          }`}
        >
          {replyToMessage && (
            <div className="mb-2 pb-2 border-b border-white/10">
              <div className="flex items-start gap-2 opacity-70">
                <Reply className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold mb-0.5">
                    {replyToMessage.role === 'user' ? 'Du' : characterName}
                  </p>
                  <p className="text-xs truncate">{replyToMessage.content}</p>
                </div>
              </div>
            </div>
          )}
          
          <ReactMarkdown className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {message.content}
          </ReactMarkdown>
        </div>
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-gray-500">
            {format(new Date(message.created_date), 'HH:mm', { locale: de })}
          </span>
          {isUser && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
        </div>
      </div>
      
      {/* Actions Menu */}
      {(showActions || message.is_pinned) && onPin && onReply && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'order-0' : 'order-2'}`}
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isUser ? 'end' : 'start'} className="bg-[#262626] border-white/10">
            <DropdownMenuItem 
              onClick={() => onReply(message)}
              className="text-gray-200 hover:bg-white/5 cursor-pointer"
            >
              <Reply className="w-4 h-4 mr-2" />
              Zitieren
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onPin(message)}
              className="text-gray-200 hover:bg-white/5 cursor-pointer"
            >
              <Pin className="w-4 h-4 mr-2" />
              {message.is_pinned ? 'Entpinnen' : 'Pinnen'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}