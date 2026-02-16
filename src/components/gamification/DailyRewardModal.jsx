import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getDailyReward, DAILY_REWARDS } from './LevelUtils';
import { motion } from 'framer-motion';
import { Gift, Flame, Check } from 'lucide-react';

export default function DailyRewardModal({ open, onClose, streak, onClaim }) {
  const [claimed, setClaimed] = useState(false);
  const reward = getDailyReward(streak + 1);
  const currentDayIndex = streak % 7;

  const handleClaim = () => {
    setClaimed(true);
    onClaim(reward);
    setTimeout(() => {
      setClaimed(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            Tägliche Belohnung
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 text-center">
          {streak > 0 && (
            <div className="flex items-center justify-center gap-1.5 mb-4">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">{streak} Tage Streak!</span>
            </div>
          )}

          {/* 7-day grid */}
          <div className="grid grid-cols-7 gap-1.5 mb-6">
            {DAILY_REWARDS.map((day, i) => {
              const isPast = i < currentDayIndex;
              const isCurrent = i === currentDayIndex;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center p-2 rounded-lg border text-center ${
                    isCurrent
                      ? 'border-yellow-500/50 bg-yellow-500/10 ring-1 ring-yellow-500/30'
                      : isPast
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : 'border-white/5 bg-white/[0.02]'
                  }`}
                >
                  <span className="text-[9px] text-gray-500">{day.label}</span>
                  <span className="text-sm mt-0.5">{isPast ? '✅' : isCurrent ? '🎁' : '🔒'}</span>
                  <span className="text-[9px] text-yellow-400 mt-0.5">🪙{day.coins}</span>
                </div>
              );
            })}
          </div>

          {/* Current reward */}
          {!claimed ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl mb-4"
            >
              <p className="text-sm text-gray-300 mb-2">Heute erhältst du:</p>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <span className="text-2xl">🪙</span>
                  <p className="text-yellow-400 font-bold">{reward.coins}</p>
                  <p className="text-[10px] text-gray-500">Coins</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl">⭐</span>
                  <p className="text-emerald-400 font-bold">+{reward.xp}</p>
                  <p className="text-[10px] text-gray-500">XP</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 text-center mb-4"
            >
              <Check className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-400 font-semibold">Eingesammelt!</p>
            </motion.div>
          )}

          {!claimed && (
            <Button
              onClick={handleClaim}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl h-11"
            >
              <Gift className="w-4 h-4 mr-2" />
              Abholen!
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}