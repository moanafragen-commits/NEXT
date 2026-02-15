import React from 'react';
import { Badge } from "@/components/ui/badge";

const MOOD_CONFIG = {
  fröhlich: { emoji: '😊', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  genervt: { emoji: '😤', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  neugierig: { emoji: '🤔', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  traurig: { emoji: '😢', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  aufgeregt: { emoji: '🤩', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  gelangweilt: { emoji: '😒', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  verträumt: { emoji: '🌙', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  ängstlich: { emoji: '😰', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  motiviert: { emoji: '💪', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  entspannt: { emoji: '😌', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  sarkastisch: { emoji: '😏', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  nachdenklich: { emoji: '🧐', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' }
};

export default function MoodBadge({ mood, size = 'default' }) {
  if (!mood) return null;
  const config = MOOD_CONFIG[mood] || { emoji: '😐', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
  
  return (
    <Badge className={`${config.color} ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : ''}`}>
      {config.emoji} {mood}
    </Badge>
  );
}

export { MOOD_CONFIG };