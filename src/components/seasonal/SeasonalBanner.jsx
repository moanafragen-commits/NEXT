import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const BUILTIN_SEASONS = [
  { key: 'valentinstag', name: 'Valentinstag', emoji: '💕', start: '02-14', end: '02-14', colors: 'from-pink-500/20 to-red-500/20', border: 'border-pink-500/30' },
  { key: 'ostern', name: 'Ostern', emoji: '🐰', start: '04-18', end: '04-21', colors: 'from-yellow-500/20 to-green-500/20', border: 'border-yellow-500/30' },
  { key: 'halloween', name: 'Halloween', emoji: '🎃', start: '10-28', end: '10-31', colors: 'from-orange-500/20 to-purple-500/20', border: 'border-orange-500/30' },
  { key: 'weihnachten', name: 'Weihnachten', emoji: '🎄', start: '12-20', end: '12-26', colors: 'from-red-500/20 to-green-500/20', border: 'border-red-500/30' },
  { key: 'silvester', name: 'Silvester', emoji: '🎆', start: '12-31', end: '01-01', colors: 'from-indigo-500/20 to-yellow-500/20', border: 'border-indigo-500/30' },
];

function getCurrentSeason() {
  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return BUILTIN_SEASONS.find(s => mmdd >= s.start && mmdd <= s.end);
}

export function getSeasonalContext() {
  const season = getCurrentSeason();
  if (!season) return '';
  return `\n\n🎉 SAISONALES EVENT: Heute ist ${season.name} ${season.emoji}! Beziehe das in deine Antworten ein – sei festlich, gratuliere, oder erwähne es beiläufig.`;
}

export default function SeasonalBanner() {
  const season = getCurrentSeason();
  
  const { data: customSeasons = [] } = useQuery({
    queryKey: ['seasonal-events'],
    queryFn: async () => {
      const events = await base44.entities.SeasonalEvent.filter({ is_active: true });
      const now = new Date().toISOString().split('T')[0];
      return events.filter(e => now >= e.start_date && now <= e.end_date);
    }
  });

  const activeSeason = season || (customSeasons.length > 0 ? {
    name: customSeasons[0].name,
    emoji: customSeasons[0].emoji,
    colors: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
    description: customSeasons[0].description
  } : null);

  if (!activeSeason) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-4 mt-2 p-3 rounded-xl bg-gradient-to-r ${activeSeason.colors} border ${activeSeason.border}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{activeSeason.emoji}</span>
        <div>
          <p className="text-sm font-semibold text-white">{activeSeason.name}</p>
          {activeSeason.description && (
            <p className="text-[10px] text-gray-400">{activeSeason.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}