import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const GESTURES = [
  { type: 'umarmung', emoji: '🤗', label: 'Umarmen' },
  { type: 'kuss_stirn', emoji: '😘', label: 'Stirnkuss' },
  { type: 'kuss_wange', emoji: '💋', label: 'Wangenkuss' },
  { type: 'kuss_mund', emoji: '💏', label: 'Kuss' },
  { type: 'hand_halten', emoji: '🤝', label: 'Hand halten' },
  { type: 'high_five', emoji: '🙌', label: 'High Five' },
  { type: 'streicheln', emoji: '🥰', label: 'Streicheln' },
  { type: 'kuscheln', emoji: '🫂', label: 'Kuscheln' },
  { type: 'tanz', emoji: '💃', label: 'Tanzen' },
  { type: 'schulter_klopfen', emoji: '👊', label: 'Schulter' },
];

export default function GesturePanel({ character, userEmail, onGestureComplete }) {
  const [showReaction, setShowReaction] = useState(null);
  const queryClient = useQueryClient();

  const gestureMutation = useMutation({
    mutationFn: async (gestureType) => {
      const gesture = GESTURES.find(g => g.type === gestureType);
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${character.name} (${character.personality}).
Beziehung: ${character.initial_relationship || 'Freund/in'}, Vertrauen: ${character.trust_level || 5}/10.
Aktuelle Stimmung: ${character.current_mood || 'neutral'}.

Der Nutzer macht folgende Geste: ${gesture.emoji} ${gesture.label}

Reagiere als ${character.name} auf diese Geste. Kurz, emotional, authentisch (1-2 Sätze).
Beachte ob die Geste zur aktuellen Beziehung passt (z.B. Kuss nur bei engen Beziehungen).`,
        response_json_schema: {
          type: "object",
          properties: {
            reaction: { type: "string" },
            mood_effect: { type: "string" },
            emoji: { type: "string" },
            accepts: { type: "boolean" }
          }
        }
      });

      await base44.entities.GestureInteraction.create({
        character_id: character.id,
        user_email: userEmail,
        gesture_type: gestureType,
        character_reaction: result.reaction,
        mood_effect: result.mood_effect,
        emoji: result.emoji || gesture.emoji
      });

      // Also add to chat as a special message
      await base44.entities.ChatMessage.create({
        character_id: character.id,
        role: 'user',
        content: `*${gesture.label}* ${gesture.emoji}`,
        status: 'read'
      });
      await base44.entities.ChatMessage.create({
        character_id: character.id,
        role: 'assistant',
        content: `${result.emoji || gesture.emoji} ${result.reaction}`,
        status: 'delivered'
      });

      return { ...result, gesture };
    },
    onSuccess: (result) => {
      setShowReaction(result);
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setTimeout(() => setShowReaction(null), 4000);
      if (onGestureComplete) onGestureComplete();
    }
  });

  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {GESTURES.map(g => (
          <button
            key={g.type}
            onClick={() => gestureMutation.mutate(g.type)}
            disabled={gestureMutation.isPending}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 transition-all press-effect disabled:opacity-50"
          >
            <span className="text-2xl">{g.emoji}</span>
            <span className="text-[9px] text-gray-400">{g.label}</span>
          </button>
        ))}
      </div>

      {gestureMutation.isPending && (
        <div className="flex items-center justify-center gap-2 mt-3 text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{character.name} reagiert...</span>
        </div>
      )}

      <AnimatePresence>
        {showReaction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-3 p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20"
          >
            <div className="flex items-start gap-2">
              <span className="text-2xl">{showReaction.emoji || showReaction.gesture.emoji}</span>
              <div>
                <p className="text-sm text-white">{showReaction.reaction}</p>
                {showReaction.mood_effect && (
                  <p className="text-[10px] text-gray-400 mt-1">Stimmung: {showReaction.mood_effect}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}