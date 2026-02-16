// XP needed per level: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 250 XP, etc.
export const XP_PER_LEVEL = [
  0, 0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000
];

export function getLevelFromXP(xp) {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i;
  }
  return 1;
}

export function getXPForNextLevel(level) {
  if (level >= XP_PER_LEVEL.length - 1) return XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
  return XP_PER_LEVEL[level + 1];
}

export function getXPProgress(xp, level) {
  const currentLevelXP = XP_PER_LEVEL[level] || 0;
  const nextLevelXP = getXPForNextLevel(level);
  const needed = nextLevelXP - currentLevelXP;
  const progress = xp - currentLevelXP;
  return needed > 0 ? Math.min(progress / needed, 1) : 1;
}

export const LEVEL_TITLES = {
  1: "Neuling",
  2: "Entdecker",
  3: "Gesprächspartner",
  4: "Vertrauter",
  5: "Begleiter",
  6: "Freund",
  7: "Seelenverwandter",
  8: "Meister",
  9: "Legende",
  10: "Unsterblich",
  11: "Göttlich",
  12: "Transzendent",
  13: "Kosmisch",
  14: "Überlegen",
  15: "Absolut",
  16: "Mythisch",
  17: "Ewigkeit",
  18: "Allwissend",
  19: "Omnipotent",
  20: "∞ Unendlich"
};

export function getLevelTitle(level) {
  return LEVEL_TITLES[level] || LEVEL_TITLES[20];
}

export const LEVEL_COLORS = {
  1: "from-gray-500 to-gray-600",
  2: "from-green-500 to-green-600",
  3: "from-blue-500 to-blue-600",
  4: "from-purple-500 to-purple-600",
  5: "from-yellow-500 to-orange-500",
  6: "from-pink-500 to-rose-500",
  7: "from-cyan-400 to-blue-500",
  8: "from-amber-400 to-orange-600",
  9: "from-red-500 to-pink-600",
  10: "from-emerald-400 to-teal-600",
};

export function getLevelColor(level) {
  if (level >= 10) return "from-amber-300 to-yellow-500";
  return LEVEL_COLORS[level] || LEVEL_COLORS[1];
}

// XP rewards for actions
export const XP_REWARDS = {
  send_message: 5,
  receive_reply: 3,
  create_character: 50,
  daily_login: 20,
  streak_bonus: 10, // per day of streak
  send_gift: 15,
  create_post: 10,
  mini_game_win: 25,
};

// Daily reward schedule (day 1-7, then repeats)
export const DAILY_REWARDS = [
  { day: 1, coins: 50, xp: 20, label: "Tag 1" },
  { day: 2, coins: 75, xp: 25, label: "Tag 2" },
  { day: 3, coins: 100, xp: 30, label: "Tag 3" },
  { day: 4, coins: 125, xp: 35, label: "Tag 4" },
  { day: 5, coins: 150, xp: 40, label: "Tag 5" },
  { day: 6, coins: 200, xp: 50, label: "Tag 6" },
  { day: 7, coins: 500, xp: 100, label: "Tag 7 🎉" },
];

export function getDailyReward(streak) {
  const dayIndex = ((streak - 1) % 7);
  return DAILY_REWARDS[dayIndex] || DAILY_REWARDS[0];
}