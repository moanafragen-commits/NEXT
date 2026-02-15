import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, CheckCheck, Pin, Reply, MoreVertical, Bookmark, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EmojiPicker from './EmojiPicker';
import { toast } from 'sonner';

export default function MessageBubble({ message, characterAvatar, characterName, onPin, onReply, onBookmark, replyToMessage }) {
  const isUser = message.role === 'user';
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${characterName}`;
  const [showActions, setShowActions] = useState(false);
  const queryClient = useQueryClient();

  const { data: reactions = [] } = useQuery({
    queryKey: ['reactions', message.id],
    queryFn: () => base44.entities.MessageReaction.filter({ message_id: message.id })
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const addReactionMutation = useMutation({
    mutationFn: async (emoji) => {
      const existing = reactions.find(r => r.user_email === user?.email && r.emoji === emoji);
      if (existing) {
        await base44.entities.MessageReaction.delete(existing.id);
      } else {
        await base44.entities.MessageReaction.create({
          message_id: message.id,
          user_email: user.email,
          emoji
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', message.id] });
    }
  });

  const groupedReactions = reactions.reduce((acc, r) => {
    acc[r.emoji] = acc[r.emoji] || [];
    acc[r.emoji].push(r);
    return acc;
  }, {});
  
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
        {/* Pinned / Bookmarked indicators */}
        <div className="flex items-center gap-2 mb-1">
          {message.is_pinned && (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <Pin className="w-3 h-3" />
              <span>Gepinnt</span>
            </div>
          )}
          {message.is_bookmarked && (
            <div className="flex items-center gap-1 text-xs text-amber-400">
              <Bookmark className="w-3 h-3 fill-amber-400" />
              <span>Markiert</span>
            </div>
          )}
        </div>
        
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
          
          {message.image_url && (
            <img 
              src={message.image_url} 
              alt="Bild" 
              className="rounded-lg max-w-full mb-2 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.image_url, '_blank')}
            />
          )}
          <ReactMarkdown className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {message.content}
          </ReactMarkdown>
        </div>
        <div className={`flex items-center gap-1.5 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-gray-500">
            {format(new Date(message.created_date), 'HH:mm', { locale: de })}
          </span>
          {isUser && message.status && (
            <div className="flex items-center gap-0.5">
              {message.status === 'read' && (
                <span className="flex items-center gap-0.5" title="Gelesen">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                </span>
              )}
              {message.status === 'delivered' && (
                <span className="flex items-center gap-0.5" title="Zugestellt">
                  <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                </span>
              )}
              {message.status === 'sent' && (
                <span className="flex items-center gap-0.5" title="Gesendet">
                  <Check className="w-3.5 h-3.5 text-gray-500" />
                </span>
              )}
              {message.status === 'sending' && (
                <span className="flex items-center gap-0.5" title="Wird gesendet...">
                  <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                </span>
              )}
            </div>
          )}
          {message.read_at && isUser && message.status === 'read' && (
            <span className="text-[9px] text-gray-600" title={`Gelesen um ${format(new Date(message.read_at), 'HH:mm', { locale: de })}`}>
              {format(new Date(message.read_at), 'HH:mm', { locale: de })}
            </span>
          )}
        </div>

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(groupedReactions).map(([emoji, users]) => {
              const hasReacted = users.some(r => r.user_email === user?.email);
              return (
                <button
                  key={emoji}
                  onClick={() => addReactionMutation.mutate(emoji)}
                  className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 transition-colors ${
                    hasReacted 
                      ? 'bg-emerald-600/20 border border-emerald-500/50' 
                      : 'bg-[#262626] border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-gray-400">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Reaction Button */}
      <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'order-0' : 'order-2'}`}>
        <EmojiPicker 
          onSelect={(emoji) => addReactionMutation.mutate(emoji)} 
          isReaction={true}
        />
      </div>
      
      {/* Actions Menu */}
      {(onPin || onReply || onBookmark) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isUser ? 'end' : 'start'} className="bg-[#262626] border-white/10">
            {onReply && (
              <DropdownMenuItem 
                onClick={() => onReply(message)}
                className="text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <Reply className="w-4 h-4 mr-2" />
                Zitieren
              </DropdownMenuItem>
            )}
            {onPin && (
              <DropdownMenuItem 
                onClick={() => onPin(message)}
                className="text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <Pin className="w-4 h-4 mr-2" />
                {message.is_pinned ? 'Entpinnen' : 'Pinnen'}
              </DropdownMenuItem>
            )}
            {onBookmark && (
              <DropdownMenuItem 
                onClick={() => onBookmark(message)}
                className="text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <Bookmark className={`w-4 h-4 mr-2 ${message.is_bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                {message.is_bookmarked ? 'Markierung entfernen' : 'Markieren'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => {
                navigator.clipboard.writeText(message.content);
                toast.success('Nachricht kopiert');
              }}
              className="text-gray-200 hover:bg-white/5 cursor-pointer"
            >
              <Copy className="w-4 h-4 mr-2" />
              Kopieren
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}