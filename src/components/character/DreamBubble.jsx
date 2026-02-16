import React from 'react';
import { Moon, Cloud, Sparkles, Skull, Heart, Eye, Clock, Zap, Brain } from 'lucide-react';

const DREAM_TYPE_CONFIG = {
  normal: { icon: Cloud, color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30', label: 'Traum', emoji: '💭' },
  alptraum: { icon: Skull, color: 'from-red-500/20 to-purple-500/20', border: 'border-red-500/30', label: 'Alptraum', emoji: '😱' },
  luzid: { icon: Eye, color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', label: 'Luzider Traum', emoji: '👁️' },
  wiederkehrend: { icon: Clock, color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', label: 'Wiederkehrend', emoji: '🔄' },
  prophetisch: { icon: Sparkles, color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', label: 'Prophetisch', emoji: '🔮' },
  nostalgisch: { icon: Heart, color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/30', label: 'Nostalgisch', emoji: '📸' },
  romantisch: { icon: Heart, color: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30', label: 'Romantisch', emoji: '💕' },
  surreal: { icon: Brain, color: 'from-fuchsia-500/20 to-pink-500/20', border: 'border-fuchsia-500/30', label: 'Surreal', emoji: '🌀' },
  angst: { icon: Zap, color: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30', label: 'Angsttraum', emoji: '😰' },
};

export default function DreamBubble({ dream, characterName }) {
  if (!dream) return null;

  const config = DREAM_TYPE_CONFIG[dream.dream_type] || DREAM_TYPE_CONFIG.normal;
  const Icon = config.icon;

  return (
    <div className={`mx-4 my-3 rounded-2xl bg-gradient-to-r ${config.color} border ${config.border} p-4 backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-2">
        <Moon className="w-4 h-4 text-indigo-300" />
        <span className="text-xs font-medium text-indigo-300">
          {config.emoji} {characterName} hatte einen {config.label}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {Array.from({ length: Math.min(5, Math.ceil(dream.intensity / 2)) }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-200 leading-relaxed italic">
        "{dream.dream_content}"
      </p>
      {dream.mood_on_waking && (
        <p className="text-xs text-gray-400 mt-2">
          Stimmung beim Aufwachen: {dream.mood_on_waking}
        </p>
      )}
      {dream.symbols && (
        <div className="flex flex-wrap gap-1 mt-2">
          {dream.symbols.split(',').map((s, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-400">
              {s.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}