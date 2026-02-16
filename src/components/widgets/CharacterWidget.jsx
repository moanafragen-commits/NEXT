import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MOOD_CONFIG } from '@/components/character/MoodBadge';

export default function CharacterWidget({ characterId }) {
  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });

  const { data: lastMsg } = useQuery({
    queryKey: ['widget-last-msg', characterId],
    queryFn: async () => {
      const msgs = await base44.entities.ChatMessage.filter({ character_id: characterId }, '-created_date', 1);
      return msgs[0];
    },
    enabled: !!characterId,
    refetchInterval: 30000
  });

  const { data: location } = useQuery({
    queryKey: ['character-location', characterId],
    queryFn: async () => {
      const locs = await base44.entities.CharacterLocation.filter({ character_id: characterId }, '-created_date', 1);
      return locs[0];
    },
    enabled: !!characterId
  });

  if (!character) return null;

  const moodInfo = MOOD_CONFIG[character.current_mood] || { emoji: '😐', classes: 'bg-gray-500/20 text-gray-300' };
  const avatar = character.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;

  return (
    <Link to={createPageUrl(`Chat?characterId=${characterId}`)}>
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#262626] rounded-2xl p-3 border border-white/5 hover:border-emerald-500/20 transition-all hover:scale-[1.02] min-w-[160px]">
        <div className="flex items-center gap-2 mb-2">
          <img src={avatar} className="w-10 h-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{character.name}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs">{moodInfo.emoji}</span>
              <span className="text-[10px] text-gray-500 truncate">{character.current_mood || 'neutral'}</span>
            </div>
          </div>
        </div>

        {location && (
          <div className="text-[10px] text-gray-500 mb-1.5 truncate">
            {location.emoji} {location.location_name}
          </div>
        )}

        {lastMsg && (
          <p className="text-xs text-gray-400 truncate leading-relaxed">
            {lastMsg.role === 'user' ? 'Du: ' : ''}{lastMsg.content}
          </p>
        )}

        {character.current_song && (
          <div className="mt-1.5 text-[10px] text-emerald-400/60 truncate">
            🎵 {character.current_song}
          </div>
        )}
      </div>
    </Link>
  );
}