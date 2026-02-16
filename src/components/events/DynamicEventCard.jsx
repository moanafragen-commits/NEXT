import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, ChevronRight, Coins, Star, Shield, AlertTriangle, Sparkles, X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import moment from 'moment';

const URGENCY_STYLES = {
  niedrig: { border: 'border-blue-500/20', glow: 'from-blue-600/10 to-indigo-600/10', badge: 'bg-blue-500/20 text-blue-300' },
  mittel: { border: 'border-amber-500/20', glow: 'from-amber-600/10 to-orange-600/10', badge: 'bg-amber-500/20 text-amber-300' },
  hoch: { border: 'border-orange-500/25', glow: 'from-orange-600/15 to-red-600/10', badge: 'bg-orange-500/20 text-orange-300' },
  kritisch: { border: 'border-red-500/30', glow: 'from-red-600/15 to-pink-600/10', badge: 'bg-red-500/20 text-red-300' },
};

const RISK_STYLES = {
  sicher: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Shield },
  mittel: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Zap },
  riskant: { color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
};

const CATEGORY_LABELS = {
  encounter: '🚪 Begegnung',
  job_challenge: '💼 Job-Herausforderung',
  relationship: '💕 Beziehung',
  opportunity: '🌟 Gelegenheit',
  crisis: '⚡ Krise',
  discovery: '🔍 Entdeckung',
  social: '👥 Soziales',
  random: '🎲 Zufall',
};

export default function DynamicEventCard({ event, character, onResolve, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [outcome, setOutcome] = useState(null);

  const style = URGENCY_STYLES[event.urgency] || URGENCY_STYLES.mittel;
  const timeLeft = event.expires_at ? moment(event.expires_at).fromNow(true) : null;
  const isResolved = event.status === 'resolved';

  const handleChoice = async (index) => {
    setChoosing(true);
    const result = await onResolve(event.id, index);
    setOutcome(result);
    setChoosing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`bg-gradient-to-br ${style.glow} ${style.border} border rounded-2xl overflow-hidden`}
    >
      {/* Header - always visible */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => !isResolved && setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{event.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-sm text-white">{event.title}</h3>
              {event.urgency === 'kritisch' && (
                <span className="animate-pulse w-2 h-2 rounded-full bg-red-500" />
              )}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{event.description}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
                {CATEGORY_LABELS[event.event_category] || '🎲 Event'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.badge}`}>
                {event.urgency}
              </span>
              {timeLeft && !isResolved && (
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeLeft}
                </span>
              )}
              {character && (
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <img src={character.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`} className="w-3.5 h-3.5 rounded-full" />
                  {character.name}
                </span>
              )}
            </div>
          </div>
          {!isResolved && !expanded && (
            <ChevronRight className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
          )}
          {!isResolved && (
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss?.(event.id); }}
              className="text-gray-600 hover:text-gray-400 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Choices - expanded */}
      <AnimatePresence>
        {expanded && !isResolved && !outcome && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            <div className="p-4 space-y-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Wähle deine Aktion</p>
              {(event.choices || []).map((choice, i) => {
                const risk = RISK_STYLES[choice.risk_level] || RISK_STYLES.mittel;
                const RiskIcon = risk.icon;
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    disabled={choosing}
                    onClick={() => handleChoice(i)}
                    className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{choice.emoji}</span>
                      <span className="font-medium text-sm text-white group-hover:text-emerald-300 transition-colors">{choice.label}</span>
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${risk.bg} ${risk.color}`}>
                        <RiskIcon className="w-2.5 h-2.5" />
                        {choice.risk_level}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 ml-7">{choice.outcome_description}</p>
                    <div className="flex items-center gap-3 ml-7 mt-1.5">
                      <span className="text-[10px] text-amber-400">🪙 +{choice.reward_coins}</span>
                      <span className="text-[10px] text-emerald-400">⭐ +{choice.reward_xp} XP</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {choosing && (
        <div className="p-6 border-t border-white/5 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="text-sm text-gray-400">Ergebnis wird ermittelt...</span>
        </div>
      )}

      {/* Outcome */}
      {(outcome || isResolved) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-white/5 bg-white/[0.02]"
        >
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-200 leading-relaxed mb-2">
                {outcome?.outcome_text || event.outcome_text}
              </p>
              <div className="flex items-center gap-3">
                {(outcome?.coins || event.reward_coins) > 0 && (
                  <span className="text-xs text-amber-400 font-medium">🪙 +{outcome?.coins || event.reward_coins}</span>
                )}
                {(outcome?.xp || event.reward_xp) > 0 && (
                  <span className="text-xs text-emerald-400 font-medium">⭐ +{outcome?.xp || event.reward_xp} XP</span>
                )}
                {outcome?.success !== undefined && (
                  <span className={`text-xs ${outcome.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {outcome.success ? '✓ Erfolg!' : '✗ Nicht optimal'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}