import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getLevelFromXP } from './LevelUtils';

export function useUserLevel(userEmail) {
  const queryClient = useQueryClient();

  const { data: userLevel, isLoading } = useQuery({
    queryKey: ['user-level', userEmail],
    queryFn: async () => {
      const levels = await base44.entities.UserLevel.filter({ user_email: userEmail });
      if (levels.length > 0) return levels[0];
      // Create initial level record
      const created = await base44.entities.UserLevel.create({
        user_email: userEmail,
        xp: 0,
        level: 1,
        coins: 100,
        total_messages_sent: 0,
        total_characters_created: 0,
        daily_streak: 0,
        longest_streak: 0
      });
      return created;
    },
    enabled: !!userEmail
  });

  const addXPMutation = useMutation({
    mutationFn: async ({ xp, coins = 0 }) => {
      if (!userLevel) return;
      const newXP = (userLevel.xp || 0) + xp;
      const newCoins = (userLevel.coins || 0) + coins;
      const newLevel = getLevelFromXP(newXP);
      
      await base44.entities.UserLevel.update(userLevel.id, {
        xp: newXP,
        level: newLevel,
        coins: newCoins
      });
      return { newLevel, oldLevel: userLevel.level, leveledUp: newLevel > userLevel.level };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-level', userEmail] });
    }
  });

  const spendCoinsMutation = useMutation({
    mutationFn: async (amount) => {
      if (!userLevel || (userLevel.coins || 0) < amount) {
        throw new Error('Nicht genug Coins');
      }
      await base44.entities.UserLevel.update(userLevel.id, {
        coins: (userLevel.coins || 0) - amount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-level', userEmail] });
    }
  });

  const claimDailyMutation = useMutation({
    mutationFn: async ({ coins, xp }) => {
      if (!userLevel) return;
      const today = new Date().toISOString().split('T')[0];
      const lastClaim = userLevel.last_daily_claim;
      
      if (lastClaim === today) throw new Error('Bereits abgeholt');

      // Check if streak continues (claimed yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const newStreak = lastClaim === yesterdayStr ? (userLevel.daily_streak || 0) + 1 : 1;
      const longestStreak = Math.max(newStreak, userLevel.longest_streak || 0);

      const newXP = (userLevel.xp || 0) + xp;
      const newCoins = (userLevel.coins || 0) + coins;
      const newLevel = getLevelFromXP(newXP);

      await base44.entities.UserLevel.update(userLevel.id, {
        xp: newXP,
        level: newLevel,
        coins: newCoins,
        last_daily_claim: today,
        daily_streak: newStreak,
        longest_streak: longestStreak
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-level', userEmail] });
    }
  });

  const canClaimDaily = () => {
    if (!userLevel) return false;
    const today = new Date().toISOString().split('T')[0];
    return userLevel.last_daily_claim !== today;
  };

  return {
    userLevel,
    isLoading,
    addXP: addXPMutation.mutate,
    spendCoins: spendCoinsMutation.mutateAsync,
    claimDaily: claimDailyMutation.mutate,
    canClaimDaily: canClaimDaily(),
  };
}