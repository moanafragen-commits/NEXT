import React from 'react';

// Calculate decayed strength based on time since last recall
export function calculateDecayedStrength(memory) {
  const baseStrength = memory.strength ?? 100;
  const lastDate = memory.last_recalled_date || memory.last_interaction_date || memory.created_date;
  if (!lastDate) return baseStrength;
  
  const daysSince = (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24);
  
  // Decay rate depends on importance
  const decayRate = memory.importance_level === 'hoch' ? 0.5 : 
                    memory.importance_level === 'mittel' ? 1.0 : 2.0;
  
  // Recall count slows decay
  const recallBonus = Math.min((memory.recall_count || 0) * 0.1, 0.5);
  
  const effectiveDecay = Math.max(0.1, decayRate - recallBonus);
  const decayed = baseStrength - (daysSince * effectiveDecay);
  
  return Math.max(5, Math.min(100, Math.round(decayed)));
}

export function getStrengthLabel(strength) {
  if (strength >= 80) return { text: 'Stark', color: 'text-emerald-400', bg: 'bg-emerald-500' };
  if (strength >= 50) return { text: 'Mittel', color: 'text-yellow-400', bg: 'bg-yellow-500' };
  if (strength >= 25) return { text: 'Verblasst', color: 'text-orange-400', bg: 'bg-orange-500' };
  return { text: 'Schwach', color: 'text-red-400', bg: 'bg-red-500' };
}

export default function MemoryStrengthBar({ memory }) {
  const strength = calculateDecayedStrength(memory);
  const label = getStrengthLabel(strength);
  
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${label.bg}`}
          style={{ width: `${strength}%` }}
        />
      </div>
      <span className={`text-[10px] font-medium ${label.color} whitespace-nowrap`}>
        {strength}% · {label.text}
      </span>
    </div>
  );
}