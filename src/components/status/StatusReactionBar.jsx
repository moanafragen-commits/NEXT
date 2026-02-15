import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

const QUICK_EMOJIS = ['🔥', '😍', '😂', '😮', '👏', '❤️', '💯', '😢'];

const QUICK_REPLIES = [
  'Wow, sieht toll aus! 🔥',
  'Das ist so cool! 😍',
  'Haha, nice! 😂',
  'Krass! 😮',
  'Mega! 💯',
  'Liebe es! ❤️'
];

export default function StatusReactionBar({ statusId, characterId, characterName, statusCaption, statusImageUrl }) {
  const [showReplies, setShowReplies] = useState(false);
  const [sent, setSent] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  // Check existing reaction
  const { data: existingReaction } = useQuery({
    queryKey: ['my-status-reaction', statusId, user?.email],
    queryFn: async () => {
      const reactions = await base44.entities.StatusReaction.filter({
        status_id: statusId,
        user_email: user.email
      });
      return reactions[0] || null;
    },
    enabled: !!statusId && !!user
  });

  const sendReactionMutation = useMutation({
    mutationFn: async (emoji) => {
      // Save as StatusReaction entity
      if (existingReaction) {
        if (existingReaction.emoji === emoji) {
          // Remove reaction if same emoji
          await base44.entities.StatusReaction.delete(existingReaction.id);
        } else {
          // Update to new emoji
          await base44.entities.StatusReaction.update(existingReaction.id, { emoji });
        }
      } else {
        await base44.entities.StatusReaction.create({
          status_id: statusId,
          status_type: 'character',
          user_email: user.email,
          emoji
        });
      }

      // Also send as chat message
      await base44.entities.ChatMessage.create({
        character_id: characterId,
        role: 'user',
        content: emoji,
        status: 'sent'
      });
    },
    onSuccess: (_, emoji) => {
      setSent(emoji);
      queryClient.invalidateQueries({ queryKey: ['my-status-reaction', statusId] });
      queryClient.invalidateQueries({ queryKey: ['status-reactions', statusId] });
      queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
      setTimeout(() => setSent(null), 2000);
    }
  });

  const handleReaction = (text) => {
    if (sendReactionMutation.isPending || !user) return;
    sendReactionMutation.mutate(text);
    setShowReplies(false);
  };

  return (
    <div className="relative">
      {/* Sent confirmation */}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-10 left-0 right-0 text-center"
          >
            <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full">
              Gesendet an {characterName} ✓
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick replies panel */}
      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full mb-2 left-0 right-0 bg-[#1a1a1a]/95 backdrop-blur-md rounded-2xl p-3 space-y-2 border border-white/10"
          >
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => handleReaction(reply)}
                className="w-full text-left text-sm text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                {reply}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji bar */}
      <div className="flex items-center gap-1">
        <div className="flex-1 flex items-center gap-1 bg-[#1a1a1a]/80 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              disabled={sendReactionMutation.isPending}
              className="flex-1 text-center text-xl hover:scale-125 active:scale-90 transition-transform disabled:opacity-50"
            >
              {emoji}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="bg-[#1a1a1a]/80 backdrop-blur-md rounded-full p-2.5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ChevronUp className={`w-5 h-5 text-white transition-transform ${showReplies ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}