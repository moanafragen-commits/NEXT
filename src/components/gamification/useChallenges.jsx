import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DAILY_CHALLENGES, WEEKLY_CHALLENGES, pickRandomChallenges } from './ChallengeDefinitions';
import { useUserLevel } from './useUserLevel';

export function useChallenges(userEmail) {
  const queryClient = useQueryClient();
  const { addXP } = useUserLevel(userEmail);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges', userEmail],
    queryFn: async () => {
      const all = await base44.entities.Challenge.filter({ user_email: userEmail }, '-created_date', 50);
      return all;
    },
    enabled: !!userEmail
  });

  const today = new Date().toISOString().split('T')[0];
  const todaysChallenges = challenges.filter(c => c.assigned_date === today && c.type === 'daily');

  // Get current week's Monday
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const mondayStr = monday.toISOString().split('T')[0];
  const weeklyChallenges = challenges.filter(c => c.assigned_date === mondayStr && c.type === 'weekly');

  const generateDailyChallenges = useMutation({
    mutationFn: async () => {
      // Always include daily_login + 2 random
      const loginChallenge = DAILY_CHALLENGES.find(c => c.key === 'daily_login');
      const others = pickRandomChallenges(DAILY_CHALLENGES.filter(c => c.key !== 'daily_login'), 2);
      const selected = [loginChallenge, ...others];

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const records = selected.map(c => ({
        user_email: userEmail,
        challenge_key: c.key,
        title: c.title,
        description: c.desc,
        emoji: c.emoji,
        type: 'daily',
        category: c.category,
        target_count: c.target,
        current_count: c.key === 'daily_login' ? 1 : 0,
        reward_xp: c.xp,
        reward_coins: c.coins,
        status: c.key === 'daily_login' ? 'completed' : 'active',
        expires_at: endOfDay.toISOString(),
        assigned_date: today
      }));

      await base44.entities.Challenge.bulkCreate(records);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenges', userEmail] })
  });

  const generateWeeklyChallenges = useMutation({
    mutationFn: async () => {
      const selected = pickRandomChallenges(WEEKLY_CHALLENGES, 3);
      const endOfWeek = new Date(monday);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const records = selected.map(c => ({
        user_email: userEmail,
        challenge_key: c.key,
        title: c.title,
        description: c.desc,
        emoji: c.emoji,
        type: 'weekly',
        category: c.category,
        target_count: c.target,
        current_count: 0,
        reward_xp: c.xp,
        reward_coins: c.coins,
        status: 'active',
        expires_at: endOfWeek.toISOString(),
        assigned_date: mondayStr
      }));

      await base44.entities.Challenge.bulkCreate(records);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenges', userEmail] })
  });

  const claimChallenge = useMutation({
    mutationFn: async (challengeId) => {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge || challenge.status !== 'completed') return;
      await base44.entities.Challenge.update(challengeId, { status: 'claimed' });
      if (addXP) addXP({ xp: challenge.reward_xp, coins: challenge.reward_coins });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenges', userEmail] })
  });

  // Auto-generate if missing
  const needsDaily = !isLoading && todaysChallenges.length === 0 && userEmail;
  const needsWeekly = !isLoading && weeklyChallenges.length === 0 && userEmail;

  return {
    dailyChallenges: todaysChallenges,
    weeklyChallenges,
    isLoading,
    needsDaily,
    needsWeekly,
    generateDaily: generateDailyChallenges.mutate,
    generateWeekly: generateWeeklyChallenges.mutate,
    claimChallenge: claimChallenge.mutate,
  };
}