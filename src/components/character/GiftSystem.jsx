import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Gift as GiftIcon, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const GIFTS = [
  { type: 'blumen', emoji: '💐', label: 'Blumen', effect: '+Liebe' },
  { type: 'schokolade', emoji: '🍫', label: 'Schokolade', effect: '+Freude' },
  { type: 'brief', emoji: '💌', label: 'Liebesbrief', effect: '+Vertrauen' },
  { type: 'teddy', emoji: '🧸', label: 'Teddybär', effect: '+Nähe' },
  { type: 'schmuck', emoji: '💍', label: 'Schmuck', effect: '+Begeisterung' },
  { type: 'parfüm', emoji: '🧴', label: 'Parfüm', effect: '+Freude' },
  { type: 'buch', emoji: '📖', label: 'Buch', effect: '+Interesse' },
  { type: 'playlist', emoji: '🎵', label: 'Playlist', effect: '+Verbindung' },
  { type: 'essen', emoji: '🍕', label: 'Lieblingsessen', effect: '+Glück' },
  { type: 'herz', emoji: '❤️', label: 'Herz', effect: '+Liebe' },
  { type: 'stern', emoji: '⭐', label: 'Stern', effect: '+Bewunderung' },
  { type: 'krone', emoji: '👑', label: 'Krone', effect: '+Stolz' },
  { type: 'diamant', emoji: '💎', label: 'Diamant', effect: '+Begeisterung' },
  { type: 'reise', emoji: '✈️', label: 'Reise', effect: '+Aufregung' },
  { type: 'ring', emoji: '💍', label: 'Ring', effect: '+Engagement' },
];

export default function GiftSystem({ character, user }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [showReaction, setShowReaction] = useState(null);
  const [selectedGift, setSelectedGift] = useState(null);

  const { data: sentGifts = [] } = useQuery({
    queryKey: ['gifts', character.id],
    queryFn: () => base44.entities.Gift.filter({ character_id: character.id }, '-created_date', 20),
    enabled: !!character.id
  });

  const sendGiftMutation = useMutation({
    mutationFn: async (giftType) => {
      const giftInfo = GIFTS.find(g => g.type === giftType);
      
      // Get AI reaction
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${character.name} (${character.personality?.slice(0, 150)}).
Der User schenkt dir: ${giftInfo.emoji} ${giftInfo.label}${message ? `\nMit der Nachricht: "${message}"` : ''}
Beziehung: ${character.initial_relationship || 'Freund'}
Stimmung: ${character.current_mood || 'neutral'}

Reagiere authentisch und emotional auf das Geschenk. Max 2 Sätze. Schreibe wie eine echte Chat-Nachricht.`,
        response_json_schema: {
          type: "object",
          properties: {
            reaction: { type: "string" },
            new_mood: { type: "string" }
          }
        }
      });

      await base44.entities.Gift.create({
        character_id: character.id,
        user_email: user.email,
        gift_type: giftType,
        message: message || null,
        reaction: response.reaction,
        mood_effect: giftInfo.effect
      });

      // Also add as chat message
      await base44.entities.ChatMessage.create({
        character_id: character.id,
        role: 'user',
        content: `🎁 *schenkt dir ${giftInfo.emoji} ${giftInfo.label}*${message ? `\n"${message}"` : ''}`,
        status: 'read'
      });
      await base44.entities.ChatMessage.create({
        character_id: character.id,
        role: 'assistant',
        content: response.reaction,
        status: 'delivered'
      });

      if (response.new_mood) {
        await base44.entities.Character.update(character.id, { current_mood: response.new_mood });
      }

      return response;
    },
    onSuccess: (response) => {
      setShowReaction(response.reaction);
      setMessage('');
      setSelectedGift(null);
      queryClient.invalidateQueries({ queryKey: ['gifts', character.id] });
      queryClient.invalidateQueries({ queryKey: ['messages', character.id] });
      queryClient.invalidateQueries({ queryKey: ['character', character.id] });
      setTimeout(() => setShowReaction(null), 5000);
    }
  });

  return (
    <div className="space-y-4">
      {/* Reaction popup */}
      <AnimatePresence>
        {showReaction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3"
          >
            <p className="text-sm text-emerald-300">💬 {showReaction}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift grid */}
      <div className="grid grid-cols-5 gap-2">
        {GIFTS.map(gift => (
          <button
            key={gift.type}
            onClick={() => setSelectedGift(selectedGift === gift.type ? null : gift.type)}
            disabled={sendGiftMutation.isPending}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              selectedGift === gift.type
                ? 'bg-emerald-500/20 border border-emerald-500/40 scale-105'
                : 'bg-white/5 border border-transparent hover:bg-white/10'
            }`}
          >
            <span className="text-xl">{gift.emoji}</span>
            <span className="text-[9px] text-gray-400 leading-tight text-center">{gift.label}</span>
          </button>
        ))}
      </div>

      {/* Send section */}
      {selectedGift && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nachricht zum Geschenk (optional)..."
            className="bg-[#262626] border-white/10 text-white text-sm placeholder-gray-500"
          />
          <Button
            onClick={() => sendGiftMutation.mutate(selectedGift)}
            disabled={sendGiftMutation.isPending}
            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500"
          >
            {sendGiftMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <GiftIcon className="w-4 h-4 mr-2" />
            )}
            Geschenk senden
          </Button>
        </motion.div>
      )}

      {/* Gift history */}
      {sentGifts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">Letzte Geschenke</p>
          <div className="flex flex-wrap gap-1.5">
            {sentGifts.slice(0, 10).map(gift => {
              const info = GIFTS.find(g => g.type === gift.gift_type);
              return (
                <span key={gift.id} className="text-lg" title={`${info?.label} – ${gift.reaction || ''}`}>
                  {info?.emoji}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}