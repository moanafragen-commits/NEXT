import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Gift } from 'lucide-react';

const CATEGORY_COLORS = {
  chat: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  social: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  kreativ: 'from-purple-500/20 to-violet-500/20 border-purple-500/30',
  erkunden: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
};

export default function ChallengeCard({ challenge, onClaim, index = 0 }) {
  const progress = Math.min(challenge.current_count / challenge.target_count, 1);
  const isCompleted = challenge.status === 'completed';
  const isClaimed = challenge.status === 'claimed';
  const colorClass = CATEGORY_COLORS[challenge.category] || CATEGORY_COLORS.erkunden;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative rounded-xl border bg-gradient-to-br p-3 ${colorClass} ${isClaimed ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{challenge.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white truncate">{challenge.title}</h4>
            {isClaimed && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">{challenge.description}</p>
          
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                className={`h-full rounded-full ${isCompleted || isClaimed ? 'bg-emerald-400' : 'bg-white/40'}`}
              />
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {challenge.current_count}/{challenge.target_count}
            </span>
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-yellow-400">⚡ {challenge.reward_xp} XP</span>
            <span className="text-[10px] text-amber-400">🪙 {challenge.reward_coins}</span>
          </div>
        </div>

        {/* Claim button */}
        {isCompleted && !isClaimed && (
          <Button
            size="sm"
            onClick={() => onClaim(challenge.id)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-7 px-2 flex-shrink-0"
          >
            <Gift className="w-3 h-3 mr-1" />
            Holen
          </Button>
        )}
      </div>
    </motion.div>
  );
}