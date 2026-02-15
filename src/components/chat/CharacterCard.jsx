import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Trash2, Star, Archive, MessageSquareX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TagManager from './TagManager';
import { getCharacterAvailability } from './ReplyDelayCalculator';

export default function CharacterCard({ character, lastMessage, unreadCount = 0, onClick, onDelete, onDeleteChat, onToggleFavorite, onToggleArchive }) {
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
  const queryClient = useQueryClient();
  const availability = getCharacterAvailability(character);
  
  const statusColor = availability.status === 'online' 
    ? 'bg-emerald-500' 
    : availability.status === 'away' 
      ? 'bg-amber-500' 
      : 'bg-gray-500';

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Character.update(character.id, {
        is_favorite: !character.is_favorite
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    }
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Character.update(character.id, {
        is_archived: !character.is_archived
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    }
  });
  
  return (
    <div 
      className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all duration-200 border-b border-white/5 group"
    >
      <Link 
        to={createPageUrl(`Chat?characterId=${character.id}`)}
        className="relative"
      >
        <img 
          src={character.avatar_url || defaultAvatar}
          alt={character.name}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/20"
        />
        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${statusColor} rounded-full border-2 border-[#111]`} />
      </Link>
      
      <Link 
        to={createPageUrl(`Chat?characterId=${character.id}`)}
        className="flex-1 min-w-0"
      >
        <div className="flex justify-between items-baseline">
          <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-white' : 'text-white'}`}>{character.name}</h3>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            {lastMessage && (
              <span className={`text-xs ${unreadCount > 0 ? 'text-emerald-400 font-semibold' : 'text-gray-500'}`}>
                {format(new Date(lastMessage.created_date), 'HH:mm', { locale: de })}
              </span>
            )}
            {unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        <p className={`text-sm truncate mt-0.5 ${unreadCount > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
          {availability.status === 'offline' ? (
            <span className="text-gray-500">{availability.label}</span>
          ) : lastMessage?.content || character.status || character.greeting || character.personality?.slice(0, 50) + '...'}
        </p>
        {character.current_song && (
          <div className="flex items-center gap-1.5 mt-1">
            <Music className="w-3 h-3 text-[#1DB954] flex-shrink-0" />
            <span className="text-[11px] text-[#1DB954] truncate">🎧 {character.current_song}</span>
            <a
              href={`https://open.spotify.com/search/${encodeURIComponent(character.current_song)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 w-4 h-4 rounded-full bg-[#1DB954] flex items-center justify-center hover:bg-[#1ed760] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-black fill-current ml-[1px]">
                <polygon points="8,5 19,12 8,19" />
              </svg>
            </a>
          </div>
        )}
        {(character.tags?.length > 0) && (
          <div className="mt-1">
            <TagManager character={character} compact={true} />
          </div>
        )}
      </Link>
      
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteMutation.mutate();
          }}
          className={character.is_favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}
        >
          <Star className={`w-4 h-4 ${character.is_favorite ? 'fill-yellow-400' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            toggleArchiveMutation.mutate();
          }}
          className="text-gray-400 hover:text-gray-300"
        >
          <Archive className="w-4 h-4" />
        </Button>
        {onDeleteChat && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChat(character.id);
            }}
            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
            title="Chat löschen"
          >
            <MessageSquareX className="w-4 h-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(character.id);
            }}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            title="Charakter löschen"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}