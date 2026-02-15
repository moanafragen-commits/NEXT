import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Trash2, Star, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CharacterCard({ character, lastMessage, onClick, onDelete, onToggleFavorite, onToggleArchive }) {
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
  const queryClient = useQueryClient();

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
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#111]" />
      </Link>
      
      <Link 
        to={createPageUrl(`Chat?characterId=${character.id}`)}
        className="flex-1 min-w-0"
      >
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
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(character.id);
          }}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}