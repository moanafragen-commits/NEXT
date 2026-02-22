import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Trophy, Target, Medal, Award, Flame, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';
import { useUserLevel } from '@/components/gamification/useUserLevel';
import { getLevelTitle, getLevelColor, getXPProgress, getXPForNextLevel } from '@/components/gamification/LevelUtils';
import ChallengesPanel from '@/components/gamification/ChallengesPanel';
import Leaderboard from '@/components/gamification/Leaderboard';
import AchievementShowcase from '@/components/gamification/AchievementShowcase';

const TABS = [
  { key: 'challenges', label: 'Challenges', icon: Target },
  { key: 'leaderboard', label: 'Rangliste', icon: Trophy },
  { key: 'achievements', label: 'Abzeichen', icon: Award },
];

export default function GamificationHub() {
  const [activeTab, setActiveTab] = useState('challenges');
  const [challengeType, setChallengeType] = useState('daily');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { userLevel } = useUserLevel(user?.email);

  const level = userLevel?.level || 1;
  const xp = userLevel?.xp || 0;
  const coins = userLevel?.coins || 0;
  const streak = userLevel?.daily_streak || 0;
  const progress = getXPProgress(xp, level);
  const nextXP = getXPForNextLevel(level);
  const colorGrad = getLevelColor(level);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 p-4">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Spielzone</h1>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorGrad} p-4`}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/70 text-xs">Level {level}</p>
                <h2 className="text-xl font-bold text-white">{getLevelTitle(level)}</h2>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-yellow-200">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold">{xp.toLocaleString()} XP</span>
                </div>
                <p className="text-white/60 text-[11px]">🪙 {coins.toLocaleString()} Coins</p>
              </div>
            </div>

            {/* XP Progress */}
            <div className="h-2 bg-black/20 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-white/80 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/50">
              <span>{Math.floor(progress * 100)}%</span>
              <span>Nächstes Level: {nextXP.toLocaleString()} XP</span>
            </div>

            {/* Stats Row */}
            <div className="flex gap-4 mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-300" />
                <div>
                  <p className="text-xs font-bold text-white">{streak}</p>
                  <p className="text-[9px] text-white/50">Streak</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-amber-300" />
                <div>
                  <p className="text-xs font-bold text-white">{userLevel?.longest_streak || 0}</p>
                  <p className="text-[9px] text-white/50">Rekord</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <div>
                  <p className="text-xs font-bold text-white">{userLevel?.total_messages_sent || 0}</p>
                  <p className="text-[9px] text-white/50">Nachrichten</p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
          <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'challenges' && (
            <motion.div key="challenges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Daily/Weekly toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setChallengeType('daily')}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    challengeType === 'daily' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  🌅 Täglich
                </button>
                <button
                  onClick={() => setChallengeType('weekly')}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    challengeType === 'weekly' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  📅 Wöchentlich
                </button>
              </div>
              {user && <ChallengesPanel userEmail={user.email} type={challengeType} />}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Leaderboard />
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {user && <AchievementShowcase userEmail={user.email} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav user={user} />
    </div>
  );
}