import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { MapPin, Home, Navigation2 } from 'lucide-react';
import { ROUTE_COLORS } from './AnimatedRoute';

export default function RouteTimeline({ character, history, charIndex, onFocus }) {
  const color = ROUTE_COLORS[charIndex % ROUTE_COLORS.length];
  const avatar = character.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;

  if (!history || history.length === 0) return null;

  const travelLabels = {
    auf_tour: '🎤 Auf Tour',
    urlaub: '🏖️ Im Urlaub',
    geschäftsreise: '💼 Geschäftsreise',
    umzug: '📦 Umzug',
    unterwegs: '🚶 Unterwegs',
    zuhause: '🏠 Zuhause',
  };

  const isAway = character.travel_status && character.travel_status !== 'zuhause';

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-3 mb-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <img src={avatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-1 ring-offset-[#111]" style={{ ringColor: color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white truncate">{character.name}</span>
            {isAway && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                {travelLabels[character.travel_status]}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-500">{history.length} Standorte • Route</span>
        </div>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, opacity: 0.8 }} />
      </div>

      {/* Timeline */}
      <div className="ml-5 border-l-2 border-white/10 pl-4 space-y-2.5">
        {history.map((loc, i) => {
          const isFirst = i === 0;
          const timeStr = loc.shared_at
            ? format(new Date(loc.shared_at), 'HH:mm', { locale: de })
            : '';
          const timeAgo = loc.shared_at
            ? formatDistanceToNow(new Date(loc.shared_at), { addSuffix: true, locale: de })
            : '';

          return (
            <div
              key={loc.id}
              className="relative cursor-pointer hover:bg-white/5 -ml-4 -mr-3 px-4 py-1.5 rounded-lg transition-colors"
              onClick={() => onFocus(loc)}
            >
              {/* Dot on timeline */}
              <div
                className="absolute -left-[9px] top-3 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: color,
                  backgroundColor: isFirst ? color : '#111'
                }}
              >
                {isFirst && <Navigation2 className="w-2 h-2 text-white" />}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{loc.emoji || '📍'}</span>
                    <span className="text-xs font-medium text-white">{loc.location_name}</span>
                  </div>
                  {loc.description && (
                    <span className="text-[10px] text-gray-500 block mt-0.5">{loc.description}</span>
                  )}
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-[10px] text-gray-400 block">{timeStr}</span>
                  <span className="text-[9px] text-gray-600 block">{timeAgo}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Home anchor */}
        {character.home_city && (
          <div className="relative -ml-4 px-4 py-1.5 opacity-50">
            <div className="absolute -left-[9px] top-3 w-4 h-4 rounded-full border-2 border-amber-500 bg-[#111] flex items-center justify-center">
              <Home className="w-2 h-2 text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🏠</span>
              <span className="text-xs text-gray-400">{character.home_address || character.home_city}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}