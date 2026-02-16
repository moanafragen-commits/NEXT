import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Coins, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TYPE_CONFIG = {
  termin: { label: 'Termin', emoji: '📅', gradient: 'from-emerald-500/15 to-teal-500/15', border: 'border-emerald-500/25' },
  aufgabe: { label: 'Aufgabe', emoji: '✅', gradient: 'from-amber-500/15 to-yellow-500/15', border: 'border-amber-500/25' },
  job_task: { label: 'Job-Auftrag', emoji: '💼', gradient: 'from-purple-500/15 to-pink-500/15', border: 'border-purple-500/25' },
  event: { label: 'Event', emoji: '🎉', gradient: 'from-pink-500/15 to-rose-500/15', border: 'border-pink-500/25' },
  erinnerung: { label: 'Erinnerung', emoji: '🔔', gradient: 'from-blue-500/15 to-indigo-500/15', border: 'border-blue-500/25' },
  geburtstag: { label: 'Geburtstag', emoji: '🎂', gradient: 'from-red-500/15 to-pink-500/15', border: 'border-red-500/25' },
};

const STATUS_CONFIG = {
  offen: { icon: Clock, color: 'text-amber-400', label: 'Offen' },
  erledigt: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Erledigt' },
  verpasst: { icon: AlertTriangle, color: 'text-red-400', label: 'Verpasst' },
  abgesagt: { icon: XCircle, color: 'text-gray-500', label: 'Abgesagt' },
};

const PRIORITY_BADGE = {
  niedrig: 'bg-gray-500/20 text-gray-400',
  mittel: 'bg-blue-500/20 text-blue-400',
  hoch: 'bg-amber-500/20 text-amber-400',
  dringend: 'bg-red-500/20 text-red-400 animate-pulse',
};

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function DayDetail({ date, entries = [], onComplete, onMiss, onCancel }) {
  if (!date) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isPast = date < todayStr;
  const isToday = date === todayStr;

  const sorted = [...entries].sort((a, b) => {
    // Priority: dringend > hoch > mittel > niedrig
    const prioOrder = { dringend: 0, hoch: 1, mittel: 2, niedrig: 3 };
    const statusOrder = { offen: 0, erledigt: 2, verpasst: 3, abgesagt: 4 };
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
    return (prioOrder[a.priority] || 2) - (prioOrder[b.priority] || 2);
  });

  return (
    <div className="px-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          {isToday ? '📍 Heute' : formatDate(date)}
        </h3>
        <span className="text-xs text-gray-500">{entries.length} Einträge</span>
      </div>

      {sorted.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-600 text-sm">Keine Einträge für diesen Tag</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {sorted.map((entry, i) => {
              const typeConf = TYPE_CONFIG[entry.entry_type] || TYPE_CONFIG.termin;
              const statusConf = STATUS_CONFIG[entry.status] || STATUS_CONFIG.offen;
              const StatusIcon = statusConf.icon;
              const isOpen = entry.status === 'offen';
              const isOverdue = isOpen && isPast;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-gradient-to-r ${typeConf.gradient} border ${typeConf.border} rounded-xl p-3.5 ${
                    isOverdue ? 'ring-1 ring-red-500/40' : ''
                  } ${entry.status === 'erledigt' ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{entry.emoji || typeConf.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className={`font-semibold text-sm ${entry.status === 'erledigt' ? 'line-through text-gray-500' : 'text-white'}`}>
                          {entry.title}
                        </p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${PRIORITY_BADGE[entry.priority]}`}>
                          {entry.priority}
                        </span>
                        {isOverdue && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">⚠️ Überfällig</span>}
                      </div>
                      {entry.description && (
                        <p className="text-xs text-gray-400 leading-relaxed mb-1.5">{entry.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 flex-wrap">
                        {entry.time && <span>🕐 {entry.time}</span>}
                        <span className={`flex items-center gap-1 ${statusConf.color}`}>
                          <StatusIcon className="w-3 h-3" /> {statusConf.label}
                        </span>
                        {(entry.reward_coins > 0 || entry.reward_xp > 0) && (
                          <span className="text-amber-400">🪙 {entry.reward_coins || 0} · +{entry.reward_xp || 0} XP</span>
                        )}
                        {(entry.penalty_coins > 0 || entry.penalty_xp > 0) && isOpen && (
                          <span className="text-red-400">⚡ -{entry.penalty_coins || 0} Coins bei Versäumnis</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {isOpen && (
                    <div className="flex gap-2 mt-3 ml-8">
                      <Button
                        size="sm"
                        onClick={() => onComplete(entry)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-xs h-7 px-3 flex-1"
                      >
                        ✓ Erledigt
                      </Button>
                      {isOverdue && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onMiss(entry)}
                          className="text-red-400 hover:bg-red-500/10 text-xs h-7 px-3"
                        >
                          Verpasst
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCancel(entry)}
                        className="text-gray-500 hover:bg-white/5 text-xs h-7 px-3"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}