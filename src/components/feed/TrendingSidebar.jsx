import React from 'react';
import { TrendingUp } from 'lucide-react';
import { getTodaysTrends } from './FeedGenerator';

export default function TrendingSidebar() {
  const trends = getTodaysTrends();

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-[15px] font-bold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Trends für dich
        </h3>
      </div>
      <div>
        {trends.map((trend, i) => (
          <div key={i} className="px-4 py-2.5 hover:bg-white/[0.03] transition-colors cursor-default">
            <p className="text-[11px] text-gray-500">Trending</p>
            <p className="text-[14px] font-semibold">{trend}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {Math.floor(Math.random() * 50 + 5) * 100} Posts
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}