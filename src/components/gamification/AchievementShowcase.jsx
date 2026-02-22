import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ACHIEVEMENT_DEFINITIONS } from '@/components/character/AchievementSystem';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const RARITY_COLORS = {
  common: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
  rare: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  epic: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  legendary: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
};

const RARITY_LABELS = { common: 'Gewöhnlich', rare: 'Selten', epic: 'Episch', legendary: 'Legendär' };
const RARITY_FILTERS = ['all', 'common', 'rare', 'epic', 'legendary'];

export default function AchievementShowcase({ userEmail }) {
  const [filter, setFilter] = useState('all');

  const { data: earned = [] } = useQuery({
    queryKey: ['achievements', userEmail],
    queryFn: () => base44.entities.Achievement.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const earnedKeys = new Set(earned.map(a => a.achievement_key));
  const totalEarned = earnedKeys.size;
  const totalAvailable = ACHIEVEMENT_DEFINITIONS.length;

  const allAchievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
    ...def,
    unlocked: earnedKeys.has(def.key),
    earnedData: earned.find(a => a.achievement_key === def.key),
  }));

  const filtered = filter === 'all' ? allAchievements : allAchievements.filter(a => a.rarity === filter);

  return (
    <div>
      {/* Progress */}
      <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Fortschritt</span>
          <span className="text-xs font-bold text-emerald-400">{totalEarned}/{totalAvailable}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
            style={{ width: `${(totalEarned / totalAvailable) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {RARITY_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
              filter === f ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f === 'all' ? 'Alle' : RARITY_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map((a, i) => (
          <motion.div
            key={a.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border bg-gradient-to-br ${
              a.unlocked ? RARITY_COLORS[a.rarity] : 'from-gray-800/50 to-gray-900/50 border-gray-700/30'
            }`}
          >
            {a.unlocked ? (
              <span className="text-2xl">{a.emoji}</span>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-gray-500" />
              </div>
            )}
            <p className={`text-[10px] font-medium text-center leading-tight ${a.unlocked ? 'text-white' : 'text-gray-500'}`}>
              {a.unlocked ? a.title : '???'}
            </p>
            <p className="text-[8px] text-gray-500">{RARITY_LABELS[a.rarity]}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}