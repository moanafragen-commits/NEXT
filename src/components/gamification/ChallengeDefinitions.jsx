// Daily challenge templates
export const DAILY_CHALLENGES = [
  { key: 'send_5_msgs', title: '5 Nachrichten senden', desc: 'Schreibe 5 Nachrichten an einen Charakter', emoji: '💬', category: 'chat', target: 5, xp: 30, coins: 40 },
  { key: 'send_10_msgs', title: '10 Nachrichten senden', desc: 'Schreibe 10 Nachrichten an Charaktere', emoji: '📨', category: 'chat', target: 10, xp: 50, coins: 60 },
  { key: 'chat_3_chars', title: '3 Chats öffnen', desc: 'Chatte mit 3 verschiedenen Charakteren', emoji: '👥', category: 'chat', target: 3, xp: 40, coins: 50 },
  { key: 'create_post', title: 'Beitrag erstellen', desc: 'Erstelle einen neuen Feed-Beitrag', emoji: '📸', category: 'social', target: 1, xp: 25, coins: 30 },
  { key: 'like_3_posts', title: '3 Posts liken', desc: 'Like 3 Beiträge im Feed', emoji: '❤️', category: 'social', target: 3, xp: 15, coins: 20 },
  { key: 'send_gift', title: 'Geschenk senden', desc: 'Sende ein Geschenk an einen Charakter', emoji: '🎁', category: 'kreativ', target: 1, xp: 20, coins: 25 },
  { key: 'visit_diary', title: 'Tagebuch lesen', desc: 'Lies das Tagebuch eines Charakters', emoji: '📖', category: 'erkunden', target: 1, xp: 15, coins: 20 },
  { key: 'check_news', title: 'Nachrichten lesen', desc: 'Lies 3 News-Artikel', emoji: '📰', category: 'erkunden', target: 3, xp: 15, coins: 20 },
  { key: 'daily_login', title: 'Täglicher Login', desc: 'Logge dich heute ein', emoji: '✅', category: 'erkunden', target: 1, xp: 10, coins: 15 },
  { key: 'comment_post', title: 'Kommentiere', desc: 'Schreibe einen Kommentar zu einem Post', emoji: '💭', category: 'social', target: 1, xp: 15, coins: 20 },
];

// Weekly challenge templates
export const WEEKLY_CHALLENGES = [
  { key: 'send_50_msgs', title: '50 Nachrichten', desc: 'Sende 50 Nachrichten diese Woche', emoji: '🔥', category: 'chat', target: 50, xp: 150, coins: 200 },
  { key: 'chat_5_chars', title: '5 Charaktere', desc: 'Chatte mit 5 verschiedenen Charakteren', emoji: '🌟', category: 'chat', target: 5, xp: 100, coins: 150 },
  { key: 'create_character', title: 'Neuer Charakter', desc: 'Erstelle einen neuen Charakter', emoji: '✨', category: 'kreativ', target: 1, xp: 75, coins: 100 },
  { key: 'create_5_posts', title: '5 Beiträge', desc: 'Erstelle 5 Feed-Beiträge', emoji: '📱', category: 'social', target: 5, xp: 100, coins: 120 },
  { key: 'earn_500xp', title: '500 XP sammeln', desc: 'Sammle 500 XP diese Woche', emoji: '⚡', category: 'erkunden', target: 500, xp: 200, coins: 250 },
  { key: 'login_5_days', title: '5 Tage Login', desc: 'Logge dich 5 Tage ein', emoji: '📅', category: 'erkunden', target: 5, xp: 120, coins: 150 },
  { key: 'reach_trust_7', title: 'Vertrauen aufbauen', desc: 'Erreiche Trust-Level 7 bei einem Charakter', emoji: '🤝', category: 'chat', target: 1, xp: 150, coins: 200 },
  { key: 'group_chat_msg', title: 'Gruppenchat', desc: 'Sende 10 Nachrichten in Gruppenchats', emoji: '👨‍👩‍👧‍👦', category: 'social', target: 10, xp: 80, coins: 100 },
];

export function pickRandomChallenges(pool, count) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}