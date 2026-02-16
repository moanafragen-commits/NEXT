import React, { useMemo } from 'react';
import { TrendingUp, X } from 'lucide-react';
import { getTodaysTrends } from './FeedGenerator';

export default function TrendingSidebar({ activeTrend, onTrendClick }) {
  const trends = getTodaysTrends();
  
  // Stable random post counts per trend
  const postCounts = useMemo(() => trends.map(() => Math.floor(Math.random() * 50 + 5) * 100), [trends.join(',')]);

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h3 className="text-[15px] font-bold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Trends für dich
        </h3>
        {activeTrend && (
          <button
            onClick={() => onTrendClick?.(null)}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-full transition-colors"
          >
            <X className="w-3 h-3" />
            Filter löschen
          </button>
        )}
      </div>
      <div>
        {trends.map((trend, i) => {
          const isActive = activeTrend === trend;
          return (
            <button
              key={i}
              onClick={() => onTrendClick?.(isActive ? null : trend)}
              className={`w-full text-left px-4 py-2.5 transition-colors ${
                isActive 
                  ? 'bg-emerald-500/10 border-l-2 border-emerald-500' 
                  : 'hover:bg-white/[0.03] border-l-2 border-transparent'
              }`}
            >
              <p className="text-[11px] text-gray-500">Trending</p>
              <p className={`text-[14px] font-semibold ${isActive ? 'text-emerald-400' : 'text-white'}`}>{trend}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {postCounts[i]} Posts
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}