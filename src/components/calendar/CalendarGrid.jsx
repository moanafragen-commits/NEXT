import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

const DOT_COLORS = {
  termin: 'bg-emerald-400',
  aufgabe: 'bg-amber-400',
  job_task: 'bg-purple-400',
  event: 'bg-pink-400',
  erinnerung: 'bg-blue-400',
  geburtstag: 'bg-red-400',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function CalendarGrid({ currentMonth, currentYear, selectedDate, onSelectDate, onChangeMonth, entries = [] }) {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Group entries by date
  const entriesByDate = {};
  entries.forEach(entry => {
    if (!entriesByDate[entry.date]) entriesByDate[entry.date] = [];
    entriesByDate[entry.date].push(entry);
  });

  const days = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEntries = entriesByDate[dateStr] || [];
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const hasOverdue = dayEntries.some(e => e.status === 'offen' && dateStr < todayStr);
    const uniqueTypes = [...new Set(dayEntries.map(e => e.entry_type))];

    days.push(
      <motion.button
        key={day}
        whileTap={{ scale: 0.9 }}
        onClick={() => onSelectDate(dateStr)}
        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all text-sm
          ${isSelected 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
            : isToday 
              ? 'bg-white/10 text-emerald-400 ring-1 ring-emerald-500/50' 
              : 'text-gray-300 hover:bg-white/5'
          }
          ${hasOverdue && !isSelected ? 'ring-1 ring-red-500/50' : ''}
        `}
      >
        <span className={`font-medium ${isSelected ? 'text-white' : ''}`}>{day}</span>
        {uniqueTypes.length > 0 && (
          <div className="flex gap-0.5 mt-0.5">
            {uniqueTypes.slice(0, 3).map((type, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : DOT_COLORS[type] || 'bg-gray-400'}`} />
            ))}
          </div>
        )}
        {dayEntries.length > 3 && (
          <span className="absolute top-0.5 right-1 text-[8px] text-gray-500">{dayEntries.length}</span>
        )}
      </motion.button>
    );
  }

  return (
    <div className="px-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => onChangeMonth(-1)} className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-bold text-white">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => onChangeMonth(1)} className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-500 uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
}