import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Flame } from 'lucide-react';

export default function CalendarStats({ entries }) {
  const open = entries.filter(e => e.status === 'offen').length;
  const done = entries.filter(e => e.status === 'erledigt').length;
  const missed = entries.filter(e => e.status === 'verpasst').length;
  const total = entries.length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  // Streak: consecutive days with all tasks completed
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayEntries = entries.filter(e => e.date === dateStr);
    if (dayEntries.length === 0) continue;
    const allDone = dayEntries.every(e => e.status === 'erledigt');
    if (allDone) streak++;
    else break;
  }

  return (
    <div className="px-4 mb-4">
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white/5 rounded-xl p-2.5 text-center">
          <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{open}</p>
          <p className="text-[9px] text-gray-500">Offen</p>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5 text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{done}</p>
          <p className="text-[9px] text-gray-500">Erledigt</p>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5 text-center">
          <AlertTriangle className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{missed}</p>
          <p className="text-[9px] text-gray-500">Verpasst</p>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5 text-center">
          <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{streak}🔥</p>
          <p className="text-[9px] text-gray-500">Streak</p>
        </div>
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Erledigung</span>
            <span>{completionRate}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}