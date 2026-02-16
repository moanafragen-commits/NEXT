import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

// All possible achievements
export const ACHIEVEMENT_DEFINITIONS = [
  // Chat achievements
  { key: 'first_chat', title: 'Erster Kontakt', emoji: '👋', desc: 'Erste Nachricht gesendet', category: 'chat', rarity: 'common' },
  { key: '10_messages', title: 'Gesprächig', emoji: '💬', desc: '10 Nachrichten gesendet', category: 'chat', rarity: 'common' },
  { key: '100_messages', title: 'Vielschreiber', emoji: '📝', desc: '100 Nachrichten gesendet', category: 'chat', rarity: 'rare' },
  { key: '500_messages', title: 'Chat-Marathonläufer', emoji: '🏃', desc: '500 Nachrichten gesendet', category: 'chat', rarity: 'epic' },
  { key: '1000_messages', title: 'Unzertrennlich', emoji: '🔗', desc: '1000 Nachrichten gesendet', category: 'chat', rarity: 'legendary' },
  { key: 'night_owl', title: 'Nachteule', emoji: '🦉', desc: 'Nach Mitternacht gechattet', category: 'chat', rarity: 'rare' },
  { key: 'early_bird', title: 'Frühaufsteher', emoji: '🐦', desc: 'Vor 6 Uhr gechattet', category: 'chat', rarity: 'rare' },
  
  // Relationship achievements
  { key: 'trust_max', title: 'Blindes Vertrauen', emoji: '🤝', desc: 'Maximales Vertrauen erreicht', category: 'beziehung', rarity: 'legendary' },
  { key: 'trust_7', title: 'Vertrauensbasis', emoji: '🤗', desc: 'Vertrauenslevel 7+ erreicht', category: 'beziehung', rarity: 'rare' },
  { key: 'first_gift', title: 'Großzügig', emoji: '🎁', desc: 'Erstes Geschenk gesendet', category: 'beziehung', rarity: 'common' },
  { key: '10_gifts', title: 'Schenk-König', emoji: '👑', desc: '10 Geschenke gesendet', category: 'beziehung', rarity: 'epic' },
  { key: 'first_conflict', title: 'Erste Krise', emoji: '⚡', desc: 'Ersten Streit überlebt', category: 'beziehung', rarity: 'rare' },
  
  // Memory achievements
  { key: '5_memories', title: 'Gutes Gedächtnis', emoji: '🧠', desc: '5 Erinnerungen erstellt', category: 'erinnerung', rarity: 'common' },
  { key: '20_memories', title: 'Gedächtnispalast', emoji: '🏰', desc: '20 Erinnerungen erstellt', category: 'erinnerung', rarity: 'rare' },
  { key: '50_memories', title: 'Elefantengedächtnis', emoji: '🐘', desc: '50 Erinnerungen erstellt', category: 'erinnerung', rarity: 'epic' },
  
  // Social achievements
  { key: '3_characters', title: 'Sozialer Kreis', emoji: '👥', desc: '3 Charaktere erstellt', category: 'social', rarity: 'common' },
  { key: '5_characters', title: 'Clique', emoji: '🎭', desc: '5 Charaktere erstellt', category: 'social', rarity: 'rare' },
  { key: '10_characters', title: 'Soziales Netzwerk', emoji: '🌐', desc: '10 Charaktere erstellt', category: 'social', rarity: 'epic' },
  { key: 'group_chat', title: 'Gruppenmensch', emoji: '👨‍👩‍👧‍👦', desc: 'Ersten Gruppenchat erstellt', category: 'social', rarity: 'common' },
  
  // Creative achievements
  { key: 'room_created', title: 'Innenarchitekt', emoji: '🏠', desc: 'Erstes Zimmer erstellt', category: 'kreativ', rarity: 'common' },
  { key: 'avatar_generated', title: 'Künstler', emoji: '🎨', desc: 'Avatar generiert', category: 'kreativ', rarity: 'common' },
  { key: 'diary_read', title: 'Tagebuch-Leser', emoji: '📖', desc: 'Tagebuch gelesen', category: 'kreativ', rarity: 'common' },
  
  // Secret achievements
  { key: 'secret_discovered', title: '???', emoji: '🔮', desc: 'Ein Geheimnis entdeckt', category: 'geheim', rarity: 'legendary' },
  { key: 'all_moods', title: 'Emotionaler Wirbelwind', emoji: '🌀', desc: '10 verschiedene Stimmungen erlebt', category: 'geheim', rarity: 'epic' },
];

const RARITY_COLORS = {
  common: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
  rare: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  epic: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  legendary: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
};

const RARITY_LABELS = {
  common: '⚪ Gewöhnlich',
  rare: '🔵 Selten',
  epic: '🟣 Episch',
  legendary: '🟡 Legendär',
};

export async function checkAndAwardAchievements(user, characters, messages, memories, gifts) {
  const existing = await base44.entities.Achievement.filter({ user_email: user.email });
  const existingKeys = new Set(existing.map(a => a.achievement_key));
  
  const toAward = [];
  const totalMessages = messages?.length || 0;
  const totalCharacters = characters?.length || 0;
  const totalMemories = memories?.length || 0;
  const totalGifts = gifts?.length || 0;

  // Check conditions
  if (totalMessages >= 1 && !existingKeys.has('first_chat')) toAward.push('first_chat');
  if (totalMessages >= 10 && !existingKeys.has('10_messages')) toAward.push('10_messages');
  if (totalMessages >= 100 && !existingKeys.has('100_messages')) toAward.push('100_messages');
  if (totalMessages >= 500 && !existingKeys.has('500_messages')) toAward.push('500_messages');
  if (totalMessages >= 1000 && !existingKeys.has('1000_messages')) toAward.push('1000_messages');
  if (totalCharacters >= 3 && !existingKeys.has('3_characters')) toAward.push('3_characters');
  if (totalCharacters >= 5 && !existingKeys.has('5_characters')) toAward.push('5_characters');
  if (totalCharacters >= 10 && !existingKeys.has('10_characters')) toAward.push('10_characters');
  if (totalMemories >= 5 && !existingKeys.has('5_memories')) toAward.push('5_memories');
  if (totalMemories >= 20 && !existingKeys.has('20_memories')) toAward.push('20_memories');
  if (totalMemories >= 50 && !existingKeys.has('50_memories')) toAward.push('50_memories');
  if (totalGifts >= 1 && !existingKeys.has('first_gift')) toAward.push('first_gift');
  if (totalGifts >= 10 && !existingKeys.has('10_gifts')) toAward.push('10_gifts');

  // Night owl / early bird
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5 && !existingKeys.has('night_owl')) toAward.push('night_owl');
  if (hour >= 4 && hour < 6 && !existingKeys.has('early_bird')) toAward.push('early_bird');

  // Trust achievements
  const maxTrust = characters?.reduce((max, c) => Math.max(max, c.trust_level || 5), 0) || 0;
  if (maxTrust >= 7 && !existingKeys.has('trust_7')) toAward.push('trust_7');
  if (maxTrust >= 10 && !existingKeys.has('trust_max')) toAward.push('trust_max');

  // Award new achievements
  for (const key of toAward) {
    const def = ACHIEVEMENT_DEFINITIONS.find(d => d.key === key);
    if (def) {
      await base44.entities.Achievement.create({
        user_email: user.email,
        achievement_key: key,
        title: def.title,
        description: def.desc,
        emoji: def.emoji,
        category: def.category,
        rarity: def.rarity
      });
    }
  }

  return toAward;
}

export default function AchievementDisplay({ userEmail }) {
  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', userEmail],
    queryFn: () => base44.entities.Achievement.filter({ user_email: userEmail }, '-created_date'),
    enabled: !!userEmail
  });

  if (achievements.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">Noch keine Achievements freigeschaltet</p>
        <p className="text-xs text-gray-600 mt-1">Chatte und interagiere um Badges zu verdienen!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {achievements.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className={`flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br border ${RARITY_COLORS[a.rarity || 'common']}`}
        >
          <span className="text-2xl">{a.emoji}</span>
          <p className="text-[10px] font-medium text-white text-center leading-tight">{a.title}</p>
          <p className="text-[8px] text-gray-400">{RARITY_LABELS[a.rarity || 'common']}</p>
        </motion.div>
      ))}
    </div>
  );
}