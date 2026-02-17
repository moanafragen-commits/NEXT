import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const CATEGORIES = [
  { key: 'alle', label: 'Alle', emoji: '🌐' },
  { key: 'musik', label: 'Musik', emoji: '🎵' },
  { key: 'entertainment', label: 'Entertainment', emoji: '🎭' },
  { key: 'tech', label: 'Tech', emoji: '💻' },
  { key: 'sport', label: 'Sport', emoji: '⚽' },
  { key: 'gastronomie', label: 'Gastro', emoji: '🍽️' },
  { key: 'mode', label: 'Mode', emoji: '👗' },
  { key: 'medien', label: 'Medien', emoji: '📱' },
  { key: 'management', label: 'Management', emoji: '📊' },
  { key: 'kreativ', label: 'Kreativ', emoji: '🎨' },
  { key: 'andere', label: 'Andere', emoji: '📦' },
];

const SALARY_RANGES = [
  { key: 'alle', label: 'Alle Gehälter' },
  { key: 'low', label: '≤15 🪙', max: 15 },
  { key: 'mid', label: '16-25 🪙', min: 16, max: 25 },
  { key: 'high', label: '26+ 🪙', min: 26 },
];

export default function JobMarketFilters({ filters, onFilterChange }) {
  const { search, category, salaryRange } = filters;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          value={search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Job, Firma oder Kategorie suchen..."
          className="w-full bg-[#1a1a1a] border-white/10 text-white pl-10 pr-10 rounded-xl placeholder-gray-500 focus-visible:ring-purple-500/50"
        />
        {search && (
          <button
            onClick={() => onFilterChange({ ...filters, search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => onFilterChange({ ...filters, category: cat.key })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              category === cat.key
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Salary Filter */}
      <div className="flex gap-1.5">
        {SALARY_RANGES.map(range => (
          <button
            key={range.key}
            onClick={() => onFilterChange({ ...filters, salaryRange: range.key })}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              salaryRange === range.key
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export { CATEGORIES, SALARY_RANGES };