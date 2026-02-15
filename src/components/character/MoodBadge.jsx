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
  nachdenklich: { emoji: '🧐', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  wütend: { emoji: '🔥', color: 'bg-red-600/20 text-red-400 border-red-600/30' },
  eifersüchtig: { emoji: '😠', color: 'bg-green-600/20 text-green-400 border-green-600/30' },
  verletzlich: { emoji: '🥺', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  übermütig: { emoji: '🤪', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' },
  dankbar: { emoji: '🙏', color: 'bg-lime-500/20 text-lime-300 border-lime-500/30' },
  einsam: { emoji: '🥀', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  verwirrt: { emoji: '😵‍💫', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  entschlossen: { emoji: '✊', color: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' },
  gleichgültig: { emoji: '🫥', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  euphorisch: { emoji: '🥳', color: 'bg-amber-400/20 text-amber-200 border-amber-400/30' },
  besorgt: { emoji: '😟', color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' },
  trotzig: { emoji: '😤', color: 'bg-orange-600/20 text-orange-400 border-orange-600/30' },
  sehnsüchtig: { emoji: '💭', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  zufrieden: { emoji: '☺️', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  misstrauisch: { emoji: '🤨', color: 'bg-stone-500/20 text-stone-300 border-stone-500/30' },
  überwältigt: { emoji: '😫', color: 'bg-red-400/20 text-red-200 border-red-400/30' },
  verlegen: { emoji: '😳', color: 'bg-pink-400/20 text-pink-200 border-pink-400/30' },
  stolz: { emoji: '😤', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  neidisch: { emoji: '😒', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  erleichtert: { emoji: '😮‍💨', color: 'bg-sky-400/20 text-sky-200 border-sky-400/30' },
  verzweifelt: { emoji: '😩', color: 'bg-gray-600/20 text-gray-400 border-gray-600/30' },
  albern: { emoji: '🤭', color: 'bg-yellow-400/20 text-yellow-200 border-yellow-400/30' },
  dramatisch: { emoji: '🎭', color: 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-600/30' },
  gelassen: { emoji: '🧘', color: 'bg-teal-400/20 text-teal-200 border-teal-400/30' },
  aggressiv: { emoji: '👊', color: 'bg-red-700/20 text-red-400 border-red-700/30' },
  flirtend: { emoji: '😘', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  müde: { emoji: '😴', color: 'bg-slate-400/20 text-slate-200 border-slate-400/30' },
  hyperfokussiert: { emoji: '🎯', color: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
  nostalgisch: { emoji: '📷', color: 'bg-amber-600/20 text-amber-400 border-amber-600/30' },
  hoffnungsvoll: { emoji: '🌅', color: 'bg-orange-400/20 text-orange-200 border-orange-400/30' },
  rebellisch: { emoji: '🤘', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  schüchtern: { emoji: '👉👈', color: 'bg-rose-400/20 text-rose-200 border-rose-400/30' },
  liebevoll: { emoji: '💗', color: 'bg-pink-400/20 text-pink-200 border-pink-400/30' },
  düster: { emoji: '🖤', color: 'bg-neutral-600/20 text-neutral-400 border-neutral-600/30' },
  verspielt: { emoji: '🎮', color: 'bg-violet-400/20 text-violet-200 border-violet-400/30' },
  warm: { emoji: '🤗', color: 'bg-orange-400/20 text-orange-200 border-orange-400/30' }
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