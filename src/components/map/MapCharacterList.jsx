import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Navigation2, MapPin, MessageCircle } from 'lucide-react';

export default function MapCharacterList({ characters, locations, onFocus }) {
  if (locations.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Noch keine Standorte geteilt</p>
        <p className="text-xs text-gray-600 mt-1">Chatte mit Charakteren um Standorte zu sehen</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {locations.map(loc => {
        const char = characters.find(c => c.id === loc.character_id);
        if (!char) return null;
        const avatar = char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`;
        const timeAgo = loc.shared_at
          ? formatDistanceToNow(new Date(loc.shared_at), { addSuffix: true, locale: de })
          : '';

        return (
          <div
            key={loc.id}
            className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all cursor-pointer group"
            onClick={() => onFocus(loc)}
          >
            <div className="relative shrink-0">
              <img
                src={avatar}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-[#111]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 text-sm bg-[#111] rounded-full w-6 h-6 flex items-center justify-center border border-white/10">
                {loc.emoji || '📍'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-white truncate">{char.name}</p>
                {loc.city && (
                  <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full shrink-0">{loc.city}</span>
                )}
              </div>
              <p className="text-xs text-emerald-400/80 truncate">{loc.location_name}</p>
              {loc.description && (
                <p className="text-[10px] text-gray-500 truncate mt-0.5">{loc.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-[10px] text-gray-600">{timeAgo}</span>
              <div className="flex gap-1">
                <Link to={createPageUrl(`Chat?characterId=${char.id}`)} onClick={e => e.stopPropagation()}>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </Link>
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Navigation2 className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}