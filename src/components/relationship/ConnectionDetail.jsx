import React from 'react';
import { X, Heart, MessageCircle, Brain, Laugh, BookOpen, Share2, Star, Sparkles } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function ConnectionDetail({ link, characters, onClose }) {
  if (!link) return null;

  const fromChar = link.from === 'user' ? null : characters.find(c => c.id === link.from);
  const toChar = link.to === 'user' ? null : characters.find(c => c.id === link.to);
  const charName = toChar?.name || fromChar?.name || 'Unbekannt';
  const isCharLink = link.isCharLink;
  const char = toChar || fromChar;

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
                {isCharLink ? `${fromChar?.name || '?'} ↔ ${toChar?.name || '?'}` : `Du & ${charName}`}
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
                {link.dynamic}
              </Badge>
            )}
          </div>
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

        {(!link.highlights || link.highlights.length === 0) && (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-xs text-gray-600">Noch keine besonderen Momente – chatte weiter!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}