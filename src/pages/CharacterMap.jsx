import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';

const LOCATION_COORDS = {
  zuhause: { x: 50, y: 70 },
  arbeit: { x: 75, y: 30 },
  café: { x: 30, y: 40 },
  restaurant: { x: 65, y: 55 },
  park: { x: 20, y: 60 },
  fitnessstudio: { x: 80, y: 65 },
  schule: { x: 45, y: 25 },
  uni: { x: 40, y: 20 },
  einkaufen: { x: 60, y: 45 },
  bar: { x: 35, y: 75 },
  kino: { x: 70, y: 40 },
  bibliothek: { x: 25, y: 30 },
  freunde: { x: 55, y: 80 },
  unterwegs: { x: 45, y: 50 },
  andere: { x: 50, y: 50 },
  krankenhaus: { x: 85, y: 25 },
  urlaub: { x: 15, y: 15 },
};

const LOCATION_COLORS = {
  zuhause: 'from-blue-500 to-blue-600',
  arbeit: 'from-gray-500 to-gray-600',
  café: 'from-amber-500 to-amber-600',
  restaurant: 'from-red-500 to-red-600',
  park: 'from-green-500 to-green-600',
  fitnessstudio: 'from-orange-500 to-orange-600',
  bar: 'from-purple-500 to-purple-600',
  kino: 'from-pink-500 to-pink-600',
  freunde: 'from-cyan-500 to-cyan-600',
  unterwegs: 'from-yellow-500 to-yellow-600',
};

export default function CharacterMap() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['all-character-locations'],
    queryFn: async () => {
      const allLocs = await base44.entities.CharacterLocation.list('-created_date', 200);
      // Get latest per character
      const latest = {};
      for (const loc of allLocs) {
        if (!latest[loc.character_id]) latest[loc.character_id] = loc;
      }
      return Object.values(latest);
    }
  });

  const activeChars = characters.filter(c => !c.is_archived && !c.is_blocked);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <MapPin className="w-5 h-5 text-emerald-400" />
          <h1 className="text-lg font-bold">Karte</h1>
        </div>
      </header>

      {/* Interactive Map */}
      <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/5" style={{ aspectRatio: '4/3' }}>
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="absolute border-t border-white/20" style={{ top: `${i * 10}%`, left: 0, right: 0 }} />
              <div className="absolute border-l border-white/20" style={{ left: `${i * 10}%`, top: 0, bottom: 0 }} />
            </React.Fragment>
          ))}
        </div>

        {/* Location labels */}
        {Object.entries(LOCATION_COORDS).map(([type, coords]) => {
          const charsHere = locations.filter(l => l.location_type === type);
          if (charsHere.length === 0) return null;
          const template = { zuhause: '🏠', arbeit: '💼', café: '☕', restaurant: '🍽️', park: '🌳', fitnessstudio: '💪', bar: '🍸', kino: '🎬', bibliothek: '📚', freunde: '👫', unterwegs: '🚶', andere: '📍', schule: '🏫', uni: '🎓', einkaufen: '🛍️', krankenhaus: '🏥', urlaub: '✈️' };
          
          return (
            <div
              key={type}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            >
              <div className="text-center">
                <div className="text-lg mb-0.5">{template[type] || '📍'}</div>
                <div className="flex -space-x-2 justify-center">
                  {charsHere.map(loc => {
                    const char = activeChars.find(c => c.id === loc.character_id);
                    if (!char) return null;
                    return (
                      <Link key={char.id} to={createPageUrl(`Chat?characterId=${char.id}`)}>
                        <motion.img
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          src={char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`}
                          className={`w-8 h-8 rounded-full object-cover border-2 border-[#1a1a1a] hover:scale-110 transition-transform bg-gradient-to-r ${LOCATION_COLORS[type] || 'from-gray-500 to-gray-600'}`}
                          title={`${char.name} - ${loc.description || loc.location_name}`}
                        />
                      </Link>
                    );
                  })}
                </div>
                <p className="text-[9px] text-gray-500 mt-0.5 max-w-[80px] truncate">{type}</p>
              </div>
            </div>
          );
        })}

        {/* Characters without location */}
        {activeChars.filter(c => !locations.find(l => l.character_id === c.id)).length > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/60 rounded-lg px-2 py-1">
            <p className="text-[9px] text-gray-500 mb-1">Standort unbekannt</p>
            <div className="flex -space-x-1">
              {activeChars.filter(c => !locations.find(l => l.character_id === c.id)).map(c => (
                <img
                  key={c.id}
                  src={c.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${c.name}`}
                  className="w-6 h-6 rounded-full object-cover border border-[#1a1a1a] opacity-50"
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Location List */}
      <div className="p-4 space-y-2 mt-2">
        <h2 className="text-sm font-semibold text-gray-400 mb-2">Aktuelle Standorte</h2>
        {locations.map(loc => {
          const char = activeChars.find(c => c.id === loc.character_id);
          if (!char) return null;
          return (
            <Link
              key={loc.id}
              to={createPageUrl(`Chat?characterId=${char.id}`)}
              className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
            >
              <img
                src={char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{char.name}</p>
                <p className="text-xs text-gray-500 truncate">{loc.emoji} {loc.location_name} – {loc.description}</p>
              </div>
            </Link>
          );
        })}
        {locations.length === 0 && (
          <p className="text-center text-gray-600 text-sm py-8">Noch keine Standorte geteilt</p>
        )}
      </div>

      <BottomNav user={user} />
    </div>
  );
}