import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Trophy, Flame, Heart, Crown, Medal } from 'lucide-react';
import { getLevelTitle, getLevelColor } from './LevelUtils';

const TABS = [
  { key: 'xp', label: 'XP', icon: Flame },
  { key: 'level', label: 'Level', icon: Crown },
  { key: 'streak', label: 'Streak', icon: Medal },
];

const MEDALS = ['🥇', '🥈', '🥉'];

function LeaderboardRow({ entry, rank, type }) {
  const isMedal = rank < 3;
  const value = type === 'xp' ? entry.xp : type === 'level' ? entry.level : entry.daily_streak;
  const subtitle = type === 'xp' ? 'XP' : type === 'level' ? getLevelTitle(entry.level) : 'Tage';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04 }}
      className={`flex items-center gap-3 px-4 py-3 ${isMedal ? 'bg-white/[0.04]' : ''} ${rank === 0 ? 'rounded-t-xl' : ''}`}
    >
      <div className="w-8 text-center flex-shrink-0">
        {isMedal ? (
          <span className="text-xl">{MEDALS[rank]}</span>
        ) : (
          <span className="text-sm text-gray-500 font-bold">#{rank + 1}</span>
        )}
      </div>

      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
        {(entry.user_email || '?')[0].toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isMedal ? 'text-white' : 'text-gray-300'}`}>
          {entry.user_email?.split('@')[0] || 'Anonym'}
        </p>
        <p className="text-[10px] text-gray-500">Level {entry.level} • {getLevelTitle(entry.level)}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${rank === 0 ? 'text-yellow-400' : rank === 1 ? 'text-gray-300' : rank === 2 ? 'text-amber-600' : 'text-gray-400'}`}>
          {(value || 0).toLocaleString()}
        </p>
        <p className="text-[10px] text-gray-500">{subtitle}</p>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('xp');

  const { data: levels = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => base44.entities.UserLevel.list('-xp', 50),
    staleTime: 60000,
  });

  const sorted = [...levels].sort((a, b) => {
    if (activeTab === 'xp') return (b.xp || 0) - (a.xp || 0);
    if (activeTab === 'level') return (b.level || 1) - (a.level || 1);
    return (b.daily_streak || 0) - (a.daily_streak || 0);
  });

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-4">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                active ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-500">Noch keine Spieler</div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
          {sorted.slice(0, 20).map((entry, i) => (
            <LeaderboardRow key={entry.id} entry={entry} rank={i} type={activeTab} />
          ))}
        </div>
      )}
    </div>
  );
}