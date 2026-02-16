import React from 'react';
import { getLevelTitle, getLevelColor } from './LevelUtils';

export default function LevelBadge({ level, size = 'sm' }) {
  const color = getLevelColor(level);
  const title = getLevelTitle(level);

  if (size === 'xs') {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${color} text-white`}>
        Lv.{level}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
          {level}
        </div>
        <span className="text-xs text-gray-400 mt-1">{title}</span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${color} text-white`}>
      Lv.{level} {title}
    </span>
  );
}