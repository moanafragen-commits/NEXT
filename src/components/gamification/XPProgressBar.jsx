import React from 'react';
import { getXPProgress, getXPForNextLevel, XP_PER_LEVEL } from './LevelUtils';

export default function XPProgressBar({ xp, level }) {
  const progress = getXPProgress(xp, level);
  const currentXP = xp - (XP_PER_LEVEL[level] || 0);
  const neededXP = getXPForNextLevel(level) - (XP_PER_LEVEL[level] || 0);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-gray-500">Level {level}</span>
        <span className="text-[11px] text-gray-500">{currentXP}/{neededXP} XP</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}