import React from 'react';
import { Filter, Eye, EyeOff, Sparkles } from 'lucide-react';

const FILTERS = [
  { key: 'all', label: 'Alle', emoji: '🌐' },
  { key: 'strong', label: 'Stark', emoji: '💪' },
  { key: 'romantic', label: 'Romantik', emoji: '💕' },
  { key: 'family', label: 'Familie', emoji: '👨‍👩‍👧' },
  { key: 'friends', label: 'Freunde', emoji: '🤝' },
  { key: 'conflict', label: 'Konflikte', emoji: '⚡' },
];

export default function MapFilters({ activeFilter, onFilterChange, showGossip, onToggleGossip, stats }) {
  return (
    <div className="px-4 py-2 border-b border-white/[0.04]">
      {/* Filter chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1.5">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
              activeFilter === f.key
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/[0.03] text-gray-500 border border-white/[0.05] hover:border-white/10'
            }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
        <button
          onClick={onToggleGossip}
          className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all flex items-center gap-1 ${
            showGossip
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'bg-white/[0.03] text-gray-600 border border-white/[0.05]'
          }`}
        >
          {showGossip ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          Klatsch
        </button>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="flex items-center gap-3 mt-1.5 text-[9px] text-gray-600">
          <span>🔗 {stats.totalConnections} Verbindungen</span>
          <span>💪 {stats.strongBonds} starke Bindungen</span>
          <span>⭐ Ø {stats.avgTrust} Vertrauen</span>
          {stats.topCharacter && <span className="text-emerald-500/60">👑 {stats.topCharacter}</span>}
        </div>
      )}
    </div>
  );
}