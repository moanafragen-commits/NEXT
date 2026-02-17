import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, Clock, Coins, Star, Users } from 'lucide-react';

const DIFFICULTY_LABELS = {
  einfach: { label: 'Einfach', color: 'text-green-400' },
  mittel: { label: 'Mittel', color: 'text-blue-400' },
  anspruchsvoll: { label: 'Anspruchsvoll', color: 'text-amber-400' },
  experte: { label: 'Experte', color: 'text-red-400' },
};

export default function JobListingDetail({ listing, onApply, isApplying, onClose }) {
  if (!listing) return null;
  const diff = DIFFICULTY_LABELS[listing.difficulty] || DIFFICULTY_LABELS.mittel;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="text-center mb-4">
          <span className="text-4xl">{listing.icon_emoji || '💼'}</span>
          <h2 className="text-xl font-bold text-white mt-2">{listing.job_title}</h2>
          <p className="text-gray-400 text-sm">{listing.employer}</p>
          {listing.is_featured && (
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              ⭐ Empfohlen
            </span>
          )}
        </div>

        {/* Description */}
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-300 leading-relaxed">{listing.description}</p>
        </div>

        {/* Requirements */}
        {listing.requirements && (
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Anforderungen</p>
            <p className="text-sm text-gray-300 leading-relaxed">{listing.requirements}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-400">🪙 {listing.salary_coins}</p>
            <p className="text-[10px] text-gray-500">Coins/Auftrag</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">⭐ {listing.xp_reward}</p>
            <p className="text-[10px] text-gray-500">XP/Auftrag</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-purple-400">👤</p>
            <p className="text-[10px] text-gray-500">{listing.manager_name || 'Manager'}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className={`text-lg font-bold ${diff.color}`}>{diff.label}</p>
            <p className="text-[10px] text-gray-500">Schwierigkeit</p>
          </div>
        </div>

        {/* Apply Button */}
        <Button
          onClick={() => onApply(listing)}
          disabled={isApplying}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-base font-semibold"
        >
          {isApplying ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Bewerbung wird verarbeitet...
            </span>
          ) : '🚀 Jetzt bewerben'}
        </Button>
      </motion.div>
    </>
  );
}