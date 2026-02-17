import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Brain, Shield, Flame, TrendingUp, Star, Users, Zap } from 'lucide-react';

function MiniStat({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white/[0.03] rounded-lg border border-white/[0.05]">
      <div className={`p-1 rounded-md ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function MapStatsPanel({ characters, messages, memories }) {
  const activeChars = characters.filter(c => !c.is_archived);
  const totalMsgs = messages.length;
  const totalMems = memories.length;
  const avgTrust = activeChars.length > 0
    ? (activeChars.reduce((s, c) => s + (c.trust_level || 5), 0) / activeChars.length).toFixed(1)
    : '0';
  const avgJealousy = activeChars.length > 0
    ? (activeChars.reduce((s, c) => s + (c.jealousy_level || 3), 0) / activeChars.length).toFixed(1)
    : '0';
  const strongBonds = activeChars.filter(c => (c.trust_level || 5) >= 7).length;
  const romanticChars = activeChars.filter(c => 
    ['Partner/in', 'Schwarm', 'Ehemann/Ehefrau', 'Verlobte/r', 'Affäre', 'Jugendliebe', 'Sandkastenliebe'].includes(c.initial_relationship)
  ).length;
  const familyChars = activeChars.filter(c =>
    ['Mutter', 'Vater', 'Schwester', 'Bruder', 'Tochter', 'Sohn', 'Großmutter/Großvater', 'Cousin/Cousine'].includes(c.initial_relationship)
  ).length;

  // Most active character
  const charMsgCounts = {};
  messages.forEach(m => {
    if (m.character_id) charMsgCounts[m.character_id] = (charMsgCounts[m.character_id] || 0) + 1;
  });
  const topCharId = Object.entries(charMsgCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topChar = activeChars.find(c => c.id === topCharId);

  // Growing relationships
  const growingCount = activeChars.filter(c => 
    c.relationship_evolution === 'sich_annähernd' || c.relationship_evolution === 'sich_vertiefend'
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="px-4 py-3 border-b border-white/[0.04] overflow-hidden"
    >
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <MiniStat icon={<Users className="w-3 h-3 text-emerald-400" />} label="Charaktere" value={activeChars.length} color="bg-emerald-500/10" />
        <MiniStat icon={<MessageCircle className="w-3 h-3 text-blue-400" />} label="Nachrichten" value={totalMsgs} color="bg-blue-500/10" />
        <MiniStat icon={<Brain className="w-3 h-3 text-purple-400" />} label="Erinnerungen" value={totalMems} color="bg-purple-500/10" />
        <MiniStat icon={<Shield className="w-3 h-3 text-amber-400" />} label="Ø Vertrauen" value={`${avgTrust}/10`} color="bg-amber-500/10" />
        <MiniStat icon={<Heart className="w-3 h-3 text-pink-400" />} label="Romanzen" value={romanticChars} color="bg-pink-500/10" />
        <MiniStat icon={<TrendingUp className="w-3 h-3 text-teal-400" />} label="Wachsend" value={growingCount} color="bg-teal-500/10" />
      </div>
      {topChar && (
        <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-500/[0.06] to-teal-500/[0.06] rounded-lg border border-emerald-500/10">
          <img src={topChar.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${topChar.name}`} className="w-6 h-6 rounded-full object-cover" alt="" />
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-emerald-400/70 uppercase tracking-wider">Engste Verbindung</p>
            <p className="text-xs font-medium text-white truncate">{topChar.name} · {charMsgCounts[topCharId]} Nachrichten</p>
          </div>
          <Star className="w-3.5 h-3.5 text-amber-400" />
        </div>
      )}
    </motion.div>
  );
}