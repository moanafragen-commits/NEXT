import React, { useState } from 'react';
import { useUserLevel } from './useUserLevel';
import LevelBadge from './LevelBadge';
import CoinDisplay from './CoinDisplay';
import XPProgressBar from './XPProgressBar';
import DailyRewardModal from './DailyRewardModal';
import { Gift, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TopBar({ userEmail }) {
  const { userLevel, isLoading, canClaimDaily, claimDaily } = useUserLevel(userEmail);
  const [showDaily, setShowDaily] = useState(false);

  if (isLoading || !userLevel) return null;

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border-b border-white/[0.04]">
        <LevelBadge level={userLevel.level} size="xs" />
        <div className="flex-1 min-w-0">
          <XPProgressBar xp={userLevel.xp} level={userLevel.level} />
        </div>
        <CoinDisplay coins={userLevel.coins} />
        
        <AnimatePresence>
          {canClaimDaily && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setShowDaily(true)}
              className="relative p-2 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
            >
              <Gift className="w-4 h-4 text-yellow-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <DailyRewardModal
        open={showDaily}
        onClose={() => setShowDaily(false)}
        streak={userLevel.daily_streak || 0}
        onClaim={(reward) => claimDaily(reward)}
      />
    </>
  );
}