import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';

const CATEGORY_COLORS = {
  musik: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  medien: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  entertainment: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  kreativ: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
  management: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  tech: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30',
  sport: 'from-green-500/20 to-lime-500/20 border-green-500/30',
  gastronomie: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
  mode: 'from-pink-500/20 to-fuchsia-500/20 border-pink-500/30',
  andere: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
};

const DIFFICULTY_LABELS = {
  einfach: { label: 'Einfach', color: 'text-green-400 bg-green-500/10' },
  mittel: { label: 'Mittel', color: 'text-blue-400 bg-blue-500/10' },
  anspruchsvoll: { label: 'Anspruchsvoll', color: 'text-amber-400 bg-amber-500/10' },
  experte: { label: 'Experte', color: 'text-red-400 bg-red-500/10' },
};

export default function JobListingCard({ listing, index, onClick, isApplied }) {
  const diff = DIFFICULTY_LABELS[listing.difficulty] || DIFFICULTY_LABELS.mittel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className={`bg-gradient-to-r ${CATEGORY_COLORS[listing.category] || CATEGORY_COLORS.andere} border rounded-2xl p-4 cursor-pointer hover:scale-[1.01] transition-transform relative overflow-hidden ${
        isApplied ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {listing.is_featured && (
        <div className="absolute top-2 right-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
      )}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{listing.icon_emoji || '💼'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-white">{listing.job_title}</p>
            {isApplied && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Angenommen ✓
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{listing.employer} • {listing.manager_name || 'Manager'}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${diff.color}`}>{diff.label}</span>
            <span className="text-[10px] text-gray-500 capitalize">{listing.category}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-amber-400 font-medium">🪙 {listing.salary_coins}/Auftrag</p>
          <p className="text-[10px] text-emerald-400">+{listing.xp_reward} XP</p>
        </div>
      </div>
    </motion.div>
  );
}

export { CATEGORY_COLORS };