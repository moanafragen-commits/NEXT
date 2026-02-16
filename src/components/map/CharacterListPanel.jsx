import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Navigation } from 'lucide-react';

export default function CharacterListPanel({ characters, locations, onFocus }) {
  return (
    <div className="space-y-1.5">
      {locations.map(loc => {
        const char = characters.find(c => c.id === loc.character_id);
        if (!char) return null;
        const timeAgo = loc.shared_at
          ? formatDistanceToNow(new Date(loc.shared_at), { addSuffix: true, locale: de })
          : '';
        const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`;

        return (
          <div
            key={loc.id}
            className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
            onClick={() => onFocus(loc)}
          >
            <div className="relative">
              <img
                src={char.avatar_url || defaultAvatar}
                className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/50"
              />
              <span className="absolute -bottom-0.5 -right-0.5 text-sm">{loc.emoji || '📍'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white truncate">{char.name}</p>
                {loc.city && <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full">{loc.city}</span>}
              </div>
              <p className="text-xs text-gray-400 truncate">{loc.location_name}</p>
              <p className="text-[10px] text-gray-600 truncate">{loc.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] text-gray-600">{timeAgo}</span>
              <Navigation className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        );
      })}
      {locations.length === 0 && (
        <p className="text-center text-gray-600 text-sm py-8">Noch keine Standorte geteilt</p>
      )}
    </div>
  );
}