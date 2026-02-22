import React, { useEffect } from 'react';
import { useChallenges } from './useChallenges';
import ChallengeCard from './ChallengeCard';

export default function ChallengesPanel({ userEmail, type = 'daily' }) {
  const {
    dailyChallenges,
    weeklyChallenges,
    isLoading,
    needsDaily,
    needsWeekly,
    generateDaily,
    generateWeekly,
    claimChallenge
  } = useChallenges(userEmail);

  useEffect(() => {
    if (needsDaily) generateDaily();
  }, [needsDaily]);

  useEffect(() => {
    if (needsWeekly) generateWeekly();
  }, [needsWeekly]);

  const challenges = type === 'daily' ? dailyChallenges : weeklyChallenges;
  const completedCount = challenges.filter(c => c.status === 'completed' || c.status === 'claimed').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">
          {completedCount}/{challenges.length} erledigt
        </p>
      </div>
      <div className="space-y-2">
        {challenges.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-4">
            {type === 'daily' ? 'Challenges werden generiert...' : 'Keine wöchentlichen Challenges'}
          </p>
        ) : (
          challenges.map((c, i) => (
            <ChallengeCard key={c.id} challenge={c} onClaim={claimChallenge} index={i} />
          ))
        )}
      </div>
    </div>
  );
}