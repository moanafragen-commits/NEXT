import React from 'react';
import { X, Heart, MessageCircle, Brain, Laugh, BookOpen, Share2, AlertTriangle, Star } from 'lucide-react';
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

function TrustBar({ value, max = 10 }) {
  const pct = (value / max) * 100;
  const color = value >= 7 ? 'bg-emerald-500' : value >= 4 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-white/10">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{value}/10</span>
    </div>
  );
}

export default function ConnectionDetail({ link, characters, onClose }) {
  if (!link) return null;

  const fromChar = link.from === 'user' ? null : characters.find(c => c.id === link.from);
  const toChar = link.to === 'user' ? null : characters.find(c => c.id === link.to);
  const charName = toChar?.name || fromChar?.name || 'Unbekannt';
  const isCharLink = link.isCharLink;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 rounded-t-2xl p-5 max-h-[60vh] overflow-y-auto z-20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">
            {isCharLink
              ? `${fromChar?.name || '?'} ↔ ${toChar?.name || '?'}`
              : `Du ↔ ${charName}`
            }
          </h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#262626] rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Bindungsstärke</p>
          <TrustBar value={Math.round(link.strength)} />
        </div>
        {!isCharLink && (
          <div className="bg-[#262626] rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Vertrauen</p>
            <TrustBar value={link.trust} />
          </div>
        )}
        <div className="bg-[#262626] rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Nachrichten</p>
          <p className="text-lg font-bold text-white">{link.msgCount}</p>
        </div>
        <div className="bg-[#262626] rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Erinnerungen</p>
          <p className="text-lg font-bold text-white">{link.memCount}</p>
        </div>
      </div>

      {/* Relationship info */}
      {!isCharLink && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">{link.relationship}</Badge>
          {link.dynamic && <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{link.dynamic}</Badge>}
        </div>
      )}

      {/* Highlights */}
      {link.highlights && link.highlights.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Highlights</p>
          {link.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-[#262626] rounded-lg p-3">
              <div className="mt-0.5">{highlightIcons[h.type] || <Star className="w-3.5 h-3.5 text-gray-500" />}</div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{highlightLabels[h.type] || h.type}</p>
                <p className="text-sm text-gray-300">{h.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {link.highlights?.length === 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-gray-600">Noch keine besonderen Momente – chatte weiter um Erinnerungen zu sammeln!</p>
        </div>
      )}
    </motion.div>
  );
}