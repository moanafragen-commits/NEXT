import React from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, Heart, Shield, Flame, Brain, Star, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const EVOLUTION_LABELS = {
  'statisch': '⏸ Statisch',
  'sich_annähernd': '📈 Annähernd',
  'sich_entfernend': '📉 Entfernend',
  'schwankend': '🌊 Schwankend',
  'sich_vertiefend': '💫 Vertiefend',
  'kompliziert': '🌀 Kompliziert',
};

const MOOD_EMOJIS = {
  'fröhlich': '😊', 'traurig': '😢', 'wütend': '🔥', 'nachdenklich': '🤔', 'verliebt': '😍',
  'gelangweilt': '😴', 'aufgeregt': '⚡', 'ängstlich': '😰', 'entspannt': '😌', 'eifersüchtig': '😤',
  'neugierig': '🧐', 'verspielt': '🎮', 'melancholisch': '🌧', 'liebevoll': '💗', 'rebellisch': '🤘',
};

export default function CharacterQuickProfile({ character, messages, memories, onClose }) {
  if (!character) return null;
  
  const charMsgs = messages.filter(m => m.character_id === character.id);
  const charMems = memories.filter(m => m.character_id === character.id);
  const firstMsgDate = charMsgs.length > 0 ? new Date(charMsgs[0].created_date) : null;
  const daysSinceFirst = firstMsgDate ? Math.floor((Date.now() - firstMsgDate.getTime()) / 86400000) : 0;
  
  const strengths = [];
  if ((character.trust_level || 5) >= 7) strengths.push('Hohes Vertrauen');
  if ((character.empathy_level || 5) >= 7) strengths.push('Sehr empathisch');
  if ((character.loyalty_level || 7) >= 8) strengths.push('Sehr loyal');
  if ((character.honesty_level || 7) >= 8) strengths.push('Sehr ehrlich');
  
  const challenges = [];
  if ((character.jealousy_level || 3) >= 7) challenges.push('Eifersüchtig');
  if ((character.stubbornness_level || 5) >= 8) challenges.push('Sehr stur');
  if ((character.impulsivity_level || 5) >= 8) challenges.push('Impulsiv');
  if (character.attachment_style === 'vermeidend') challenges.push('Vermeidend');
  if (character.attachment_style === 'ängstlich') challenges.push('Klammend');

  const moodEmoji = MOOD_EMOJIS[character.current_mood] || '😐';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="absolute bottom-0 left-0 right-0 bg-[#111]/95 backdrop-blur-xl border-t border-white/[0.08] rounded-t-3xl max-h-[60vh] overflow-y-auto z-20"
    >
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-white/10" />
      </div>
      
      <div className="p-5 pt-2">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={character.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`}
            alt={character.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/30"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-lg">{character.name}</h3>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {character.initial_relationship && (
                <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px]">
                  {character.initial_relationship}
                </Badge>
              )}
              {character.current_mood && (
                <span className="text-xs text-gray-400">{moodEmoji} {character.current_mood}</span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-white h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-white/[0.03] rounded-lg border border-white/[0.05]">
            <p className="text-lg font-bold text-emerald-400">{character.trust_level || 5}</p>
            <p className="text-[8px] text-gray-500 uppercase">Vertrauen</p>
          </div>
          <div className="text-center p-2 bg-white/[0.03] rounded-lg border border-white/[0.05]">
            <p className="text-lg font-bold text-orange-400">{character.jealousy_level || 3}</p>
            <p className="text-[8px] text-gray-500 uppercase">Eifersucht</p>
          </div>
          <div className="text-center p-2 bg-white/[0.03] rounded-lg border border-white/[0.05]">
            <p className="text-lg font-bold text-blue-400">{charMsgs.length}</p>
            <p className="text-[8px] text-gray-500 uppercase">Nachrichten</p>
          </div>
          <div className="text-center p-2 bg-white/[0.03] rounded-lg border border-white/[0.05]">
            <p className="text-lg font-bold text-purple-400">{daysSinceFirst}</p>
            <p className="text-[8px] text-gray-500 uppercase">Tage</p>
          </div>
        </div>

        {/* Evolution */}
        {character.relationship_evolution && character.relationship_evolution !== 'statisch' && (
          <div className="p-2.5 mb-3 rounded-xl bg-gradient-to-r from-emerald-500/[0.06] to-teal-500/[0.06] border border-emerald-500/10 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-300">{EVOLUTION_LABELS[character.relationship_evolution] || character.relationship_evolution}</p>
          </div>
        )}

        {/* Strengths & Challenges */}
        {(strengths.length > 0 || challenges.length > 0) && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {strengths.length > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10">
                <p className="text-[9px] text-emerald-400/70 uppercase tracking-wider mb-1.5">Stärken</p>
                {strengths.map((s, i) => (
                  <p key={i} className="text-[11px] text-emerald-300 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5" /> {s}
                  </p>
                ))}
              </div>
            )}
            {challenges.length > 0 && (
              <div className="p-2.5 rounded-xl bg-red-500/[0.05] border border-red-500/10">
                <p className="text-[9px] text-red-400/70 uppercase tracking-wider mb-1.5">Herausforderungen</p>
                {challenges.map((c, i) => (
                  <p key={i} className="text-[11px] text-red-300 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> {c}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pet names & Love Language */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {character.pet_names && (
            <div className="p-2.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/10">
              <p className="text-[9px] text-amber-400/70 uppercase tracking-wider mb-1">Kosenamen</p>
              <p className="text-xs text-amber-200">„{character.pet_names}"</p>
            </div>
          )}
          {character.love_language && (
            <div className="p-2.5 rounded-xl bg-pink-500/[0.05] border border-pink-500/10">
              <p className="text-[9px] text-pink-400/70 uppercase tracking-wider mb-1">Liebessprache</p>
              <p className="text-xs text-pink-200">💝 {character.love_language}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link to={createPageUrl(`Chat?characterId=${character.id}`)}>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 h-9 text-xs">
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Chat öffnen
            </Button>
          </Link>
          <Link to={createPageUrl(`CharacterInfo?characterId=${character.id}`)}>
            <Button variant="outline" className="w-full border-white/10 text-gray-300 hover:text-white hover:bg-white/10 h-9 text-xs">
              <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
              Profil ansehen
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}