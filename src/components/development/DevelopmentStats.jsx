import React from 'react';
import { motion } from 'framer-motion';

function StatBar({ label, value, max, color, emoji }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <span>{emoji}</span> {label}
        </span>
        <span className={`text-xs font-bold ${color}`}>{value}/{max}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </div>
  );
}

export default function DevelopmentStats({ character, memories, messages, events }) {
  const totalMessages = messages.length;
  const totalMemories = memories.length;
  const aiMemories = memories.filter(m => m.source === 'ai_extracted').length;
  const strongMemories = memories.filter(m => (m.strength ?? 100) >= 50).length;

  // Calculate relationship score based on events
  const positiveEvents = events.filter(e => e.impact_score > 0).length;
  const negativeEvents = events.filter(e => e.impact_score < 0).length;
  const relationshipScore = Math.min(100, Math.max(0, 50 + (positiveEvents * 5) - (negativeEvents * 3)));

  return (
    <div className="space-y-5">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#262626] rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{totalMessages}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Nachrichten</div>
        </div>
        <div className="bg-[#262626] rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{totalMemories}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Erinnerungen</div>
        </div>
        <div className="bg-[#262626] rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">{aiMemories}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">KI-Erinnerungen</div>
        </div>
        <div className="bg-[#262626] rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-pink-400">{events.length}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Ereignisse</div>
        </div>
      </div>

      {/* Attribute Bars */}
      <div className="bg-[#262626] rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Charakter-Attribute</h4>
        <StatBar label="Vertrauen" value={character.trust_level || 5} max={10} color="text-blue-400" emoji="🛡️" />
        <StatBar label="Eifersucht" value={character.jealousy_level || 3} max={10} color="text-green-400" emoji="💚" />
        <StatBar label="Empathie" value={character.empathy_level || 5} max={10} color="text-pink-400" emoji="💗" />
        <StatBar label="Emotionale Tiefe" value={character.emotional_depth || 5} max={10} color="text-purple-400" emoji="🌊" />
        <StatBar label="Formalität" value={character.formality_level || 5} max={10} color="text-amber-400" emoji="🎩" />
        <StatBar label="Kreativität" value={Math.round((character.creativity || 50) / 10)} max={10} color="text-cyan-400" emoji="✨" />
      </div>

      {/* Relationship Health */}
      <div className="bg-[#262626] rounded-xl p-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Beziehungs-Gesundheit</h4>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3"
              />
              <motion.path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={relationshipScore >= 70 ? '#10b981' : relationshipScore >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${relationshipScore}, 100` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{relationshipScore}</span>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-white">
              {relationshipScore >= 70 ? '💚 Starke Beziehung' : relationshipScore >= 40 ? '💛 Stabile Beziehung' : '💔 Angespannte Beziehung'}
            </p>
            <p className="text-xs text-gray-500">
              {positiveEvents} positive · {negativeEvents} negative Ereignisse
            </p>
            <p className="text-xs text-gray-500">
              {strongMemories} von {totalMemories} Erinnerungen sind noch stark
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}