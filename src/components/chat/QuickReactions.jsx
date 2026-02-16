import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];

export default function QuickReactions({ messageId, userEmail, existingReactions = [] }) {
  const [show, setShow] = useState(false);
  const queryClient = useQueryClient();

  const toggleReaction = useMutation({
    mutationFn: async (emoji) => {
      const existing = existingReactions.find(r => r.user_email === userEmail && r.emoji === emoji);
      if (existing) {
        await base44.entities.MessageReaction.delete(existing.id);
      } else {
        await base44.entities.MessageReaction.create({
          message_id: messageId,
          user_email: userEmail,
          emoji
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', messageId] });
      setShow(false);
    }
  });

  return (
    <div className="relative">
      {/* Double-tap hint area (triggers on long press for mobile) */}
      <button
        onClick={() => setShow(!show)}
        className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300"
      >
        <span className="text-sm">😊</span>
      </button>

      <AnimatePresence>
        {show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setShow(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 400 }}
              className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-40 bg-[#1a1a1a] rounded-full shadow-2xl border border-white/10 px-1.5 py-1 flex items-center gap-0.5"
            >
              {QUICK_EMOJIS.map((emoji, i) => {
                const hasReacted = existingReactions.some(r => r.user_email === userEmail && r.emoji === emoji);
                return (
                  <motion.button
                    key={emoji}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.03, type: 'spring', stiffness: 500 }}
                    onClick={() => toggleReaction.mutate(emoji)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-lg transition-all hover:scale-125 ${
                      hasReacted ? 'bg-emerald-500/20 ring-1 ring-emerald-500/40' : 'hover:bg-white/10'
                    }`}
                  >
                    {emoji}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}