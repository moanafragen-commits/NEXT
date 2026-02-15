import React from 'react';
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import moment from 'moment';
import MemoryStrengthBar from '@/components/memory/MemoryStrengthBar';

const CATEGORY_ICONS = {
  user_preferences: '⭐',
  past_events: '📅',
  user_goals: '🎯',
  personal_info: 'ℹ️',
  shared_experiences: '🤝',
  inside_jokes: '😂',
  important_dates: '📆',
  general: '💭'
};

export default function KeyMemoriesPanel({ memories }) {
  // Sort by importance then strength
  const sorted = [...memories]
    .filter(m => m.memory_text && m.memory_type !== 'relationship')
    .sort((a, b) => {
      const impOrder = { hoch: 3, mittel: 2, niedrig: 1 };
      const impDiff = (impOrder[b.importance_level] || 2) - (impOrder[a.importance_level] || 2);
      if (impDiff !== 0) return impDiff;
      return (b.strength ?? 100) - (a.strength ?? 100);
    });

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-3xl mb-2">🧠</p>
        <p className="text-sm">Noch keine Erinnerungen.</p>
        <p className="text-xs mt-1">Erinnerungen werden automatisch aus Gesprächen extrahiert.</p>
      </div>
    );
  }

  // Group by category
  const grouped = {};
  for (const m of sorted) {
    const cat = m.memory_category || 'general';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(m);
  }

  const CATEGORY_LABELS = {
    user_preferences: 'Vorlieben',
    past_events: 'Vergangene Ereignisse',
    user_goals: 'Ziele',
    personal_info: 'Persönliche Infos',
    shared_experiences: 'Gemeinsame Erlebnisse',
    inside_jokes: 'Insider-Witze',
    important_dates: 'Wichtige Daten',
    general: 'Allgemein'
  };

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([cat, mems]) => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-2">
            <span>{CATEGORY_ICONS[cat] || '💭'}</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {CATEGORY_LABELS[cat] || cat}
            </span>
            <span className="text-[10px] text-gray-600">({mems.length})</span>
          </div>
          <div className="space-y-2">
            {mems.map((memory, idx) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-[#262626] rounded-lg p-3 border border-white/5"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 leading-relaxed">{memory.memory_text}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge
                        className={`text-[10px] py-0 ${
                          memory.importance_level === 'hoch' ? 'bg-red-500/20 text-red-300' :
                          memory.importance_level === 'mittel' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {memory.importance_level}
                      </Badge>
                      {memory.source === 'ai_extracted' && (
                        <Badge className="text-[10px] py-0 bg-purple-500/20 text-purple-300">🤖 KI</Badge>
                      )}
                      {memory.recall_count > 0 && (
                        <span className="text-[10px] text-gray-500">{memory.recall_count}× erinnert</span>
                      )}
                      <span className="text-[10px] text-gray-600">{moment(memory.created_date).fromNow()}</span>
                    </div>
                    <div className="mt-2">
                      <MemoryStrengthBar memory={memory} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}