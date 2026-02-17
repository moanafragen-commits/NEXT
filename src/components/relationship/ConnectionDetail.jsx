import React from 'react';
import { X, Heart, MessageCircle, Brain, Laugh, BookOpen, Share2, Star, Sparkles, Shield, Flame, ArrowUpRight, ArrowDownRight, Minus, Link2, Eye, Frown, Smile, Zap } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const highlightIcons = {
  memory: <Brain className="w-3.5 h-3.5 text-blue-400" />,
  backstory: <BookOpen className="w-3.5 h-3.5 text-purple-400" />,
  joke: <Laugh className="w-3.5 h-3.5 text-amber-400" />,
  shared: <Heart className="w-3.5 h-3.5 text-pink-400" />,
  shared_info: <Share2 className="w-3.5 h-3.5 text-teal-400" />
};

const highlightLabels = {
  memory: 'Wichtige Erinnerung',
  backstory: 'Hintergrundgeschichte',
  joke: 'Insider-Witz',
  shared: 'Gemeinsame Erinnerung',
  shared_info: 'Geteilte Info'
};

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
      {typeof value === 'number' && value <= 10 ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(value / 10) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${color || 'bg-emerald-500'}`} 
            />
          </div>
          <span className="text-xs font-semibold text-white">{value}/10</span>
        </div>
      ) : (
        <p className="text-xl font-bold text-white">{value}</p>
      )}
    </div>
  );
}

const eventTypeEmojis = {
  trust_change: '🤝',
  jealousy_change: '😤',
  milestone: '🏆',
  conflict: '⚡',
  bonding: '💕',
  revelation: '💡',
  boundary_crossed: '🚧',
  memory_formed: '🧠',
  flirt_moment: '😏',
  deep_talk: '🌙',
  betrayal: '💔',
  reconciliation: '🕊️',
  inside_joke_born: '😂',
  vulnerability_shared: '🥺',
};

const DYNAMIC_LABELS = {
  'gleichberechtigt': '⚖️ Gleichberechtigt',
  'dominant': '👑 Dominant',
  'unterwürfig': '🙇 Unterwürfig',
  'beschützend': '🛡️ Beschützend',
  'spielerisch': '🎲 Spielerisch',
  'romantisch_spannend': '🔥 Romantisch',
  'kalt_distanziert': '🧊 Distanziert',
  'neckend_flirtend': '😜 Neckend',
  'toxisch': '☠️ Toxisch',
  'heilend': '💚 Heilend',
  'intellektuell': '🧠 Intellektuell',
  'leidenschaftlich': '💘 Leidenschaftlich',
  'vertrauensvoll': '🤝 Vertrauensvoll',
  'misstrauisch_vorsichtig': '🤨 Vorsichtig',
};

const ATTACHMENT_LABELS = {
  'sicher': { label: '🟢 Sicher', desc: 'Fühlt sich wohl mit Nähe & Distanz' },
  'ängstlich': { label: '🟡 Ängstlich', desc: 'Braucht Bestätigung, Angst vor Verlust' },
  'vermeidend': { label: '🔴 Vermeidend', desc: 'Meidet zu viel Nähe' },
  'desorganisiert': { label: '🟠 Desorganisiert', desc: 'Schwankt zwischen Nähe & Flucht' },
};

export default function ConnectionDetail({ link, characters, relationshipEvents = [], onClose }) {
  if (!link) return null;

  const fromChar = link.from === 'user' ? null : characters.find(c => c.id === link.from);
  const toChar = link.to === 'user' ? null : characters.find(c => c.id === link.to);
  const charName = toChar?.name || fromChar?.name || 'Unbekannt';
  const isCharLink = link.isCharLink;
  const char = toChar || fromChar;

  const charEvents = char ? relationshipEvents.filter(e => e.character_id === char.id).slice(0, 8) : [];
  const attachmentInfo = ATTACHMENT_LABELS[link.attachmentStyle];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute bottom-0 left-0 right-0 bg-[#111]/95 backdrop-blur-xl border-t border-white/[0.08] rounded-t-3xl max-h-[65vh] overflow-y-auto z-20"
    >
      {/* Handle bar */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-white/10" />
      </div>

      <div className="p-5 pt-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {char?.avatar_url && (
              <img src={char.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30" />
            )}
            <div>
              <h3 className="font-semibold text-white text-base">
                {isCharLink ? `${fromChar?.name || '?'} ↔ ${toChar?.name || '?'}` : `${link.petNames ? link.petNames.split(',')[0].trim() : 'Du'} & ${charName}`}
              </h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Bindungsstärke {link.strength.toFixed(1)}/10
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Pet names - how the character calls the user */}
        {!isCharLink && link.petNames && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[10px] text-amber-400/80 uppercase tracking-wider font-semibold">Nennt dich</p>
            </div>
            <p className="text-sm text-amber-200 font-medium">„{link.petNames}"</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatCard 
            label="Bindung" 
            value={Math.round(link.strength)} 
            icon={<Heart className="w-3 h-3 text-pink-400" />}
            color="bg-gradient-to-r from-pink-500 to-rose-500"
          />
          {!isCharLink && (
            <StatCard 
              label="Vertrauen" 
              value={link.trust}
              icon={<Star className="w-3 h-3 text-amber-400" />}
              color={link.trust >= 7 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : link.trust >= 4 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}
            />
          )}
          {!isCharLink && (
            <StatCard 
              label="Eifersucht" 
              value={link.jealousy || 3}
              icon={<Flame className="w-3 h-3 text-orange-400" />}
              color={link.jealousy >= 7 ? 'bg-gradient-to-r from-red-500 to-orange-500' : link.jealousy >= 4 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}
            />
          )}
          <StatCard 
            label="Nachrichten" 
            value={link.msgCount}
            icon={<MessageCircle className="w-3 h-3 text-blue-400" />}
          />
          <StatCard 
            label="Erinnerungen" 
            value={link.memCount}
            icon={<Brain className="w-3 h-3 text-purple-400" />}
          />
        </div>

        {/* Relationship Badges */}
        {!isCharLink && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs px-2.5 py-1">
              {link.relationship}
            </Badge>
            {link.dynamic && (
              <Badge className="bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs px-2.5 py-1">
                {DYNAMIC_LABELS[link.dynamic] || link.dynamic}
              </Badge>
            )}
            {link.mood && (
              <Badge className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs px-2.5 py-1">
                🎭 {link.mood}
              </Badge>
            )}
            {link.loveLanguage && (
              <Badge className="bg-pink-500/10 text-pink-300 border border-pink-500/20 text-xs px-2.5 py-1">
                💝 {link.loveLanguage}
              </Badge>
            )}
          </div>
        )}

        {/* Attachment Style Detail */}
        {!isCharLink && attachmentInfo && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/10">
            <div className="flex items-center gap-2 mb-0.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <p className="text-[10px] text-indigo-400/80 uppercase tracking-wider font-semibold">Bindungsstil</p>
            </div>
            <p className="text-sm text-indigo-200 font-medium">{attachmentInfo.label}</p>
            <p className="text-[11px] text-indigo-300/60 mt-0.5">{attachmentInfo.desc}</p>
          </div>
        )}

        {/* Relationship Evolution */}
        {!isCharLink && link.evolution && link.evolution !== 'statisch' && (
          <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2">
              {link.evolution === 'sich_annähernd' || link.evolution === 'sich_vertiefend' ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : link.evolution === 'sich_entfernend' ? (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              ) : (
                <Zap className="w-4 h-4 text-amber-400" />
              )}
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Beziehungsentwicklung</p>
                <p className="text-xs text-white font-medium">
                  {{
                    'sich_annähernd': '📈 Ihr nähert euch an',
                    'sich_entfernend': '📉 Ihr entfernt euch',
                    'schwankend': '📊 Schwankend – mal nah, mal fern',
                    'sich_vertiefend': '💫 Tiefe Verbindung wächst',
                    'kompliziert': '🌀 Es ist kompliziert'
                  }[link.evolution] || link.evolution}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick action: go to chat */}
        {!isCharLink && char && (
          <Link 
            to={createPageUrl(`Chat?characterId=${char.id}`)}
            className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300 font-medium">Chat mit {charName} öffnen</span>
          </Link>
        )}

        {/* Highlights */}
        {link.highlights && link.highlights.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-2">Highlights</p>
            {link.highlights.map((h, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3"
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-white/[0.05]">
                  {highlightIcons[h.type] || <Star className="w-3.5 h-3.5 text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">{highlightLabels[h.type] || h.type}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{h.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Compatibility Score */}
        {!isCharLink && link.trust > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/[0.05] to-pink-500/[0.05] border border-white/[0.06]">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Kompatibilität</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((link.trust * 0.4) + (Math.min(link.msgCount, 100) / 100 * 30) + (Math.min(link.memCount, 20) / 20 * 30)))}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-pink-500"
                />
              </div>
              <span className="text-xs font-bold text-white">{Math.round(link.strength * 10)}%</span>
            </div>
          </div>
        )}

        {(!link.highlights || link.highlights.length === 0) && charEvents.length === 0 && (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-xs text-gray-600">Noch keine besonderen Momente – chatte weiter!</p>
          </div>
        )}

        {/* Relationship Timeline */}
        {charEvents.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-2">Beziehungs-Timeline</p>
            {charEvents.map((evt, i) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 relative"
              >
                {i < charEvents.length - 1 && (
                  <div className="absolute left-[14px] top-8 bottom-0 w-px bg-white/[0.06]" />
                )}
                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm ${
                  (evt.impact_score || 0) > 0 ? 'bg-emerald-500/15' : (evt.impact_score || 0) < 0 ? 'bg-red-500/15' : 'bg-white/[0.05]'
                }`}>
                  {eventTypeEmojis[evt.event_type] || '✨'}
                </div>
                <div className="flex-1 min-w-0 pb-3">
                  <p className="text-xs text-white leading-relaxed">{evt.description}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {new Date(evt.created_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    {evt.impact_score ? (
                      <span className={`ml-2 ${evt.impact_score > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {evt.impact_score > 0 ? '+' : ''}{evt.impact_score} Impact
                      </span>
                    ) : null}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}