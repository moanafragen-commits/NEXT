import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓'],
  'Gesten': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾'],
  'Herzen': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Symbole': ['✨', '⭐', '🌟', '💫', '🔥', '💥', '💢', '💯', '✅', '☑️', '❌', '⚠️', '🚫', '💬', '💭', '🗨️', '👁️', '🎉', '🎊', '🎈']
};

export default function EmojiPicker({ onSelect, isReaction = false }) {
  const [showPicker, setShowPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Smileys');

  const { data: customEmojis = [] } = useQuery({
    queryKey: ['custom-emojis'],
    queryFn: () => base44.entities.CustomEmoji.list('-created_date', 100)
  });

  const customMap = {};
  customEmojis.forEach(ce => { customMap[ce.original_emoji] = ce.image_url; });

  const handleSelect = (emoji) => {
    onSelect(emoji);
    if (isReaction) setShowPicker(false);
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShowPicker(!showPicker)}
        className="text-gray-400 hover:text-white hover:bg-white/10"
      >
        <Smile className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowPicker(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#262626] rounded-xl shadow-xl border border-white/10 p-3 z-50 w-[min(90vw,320px)]"
            >
              {/* Category Tabs */}
              <div className="flex gap-1 mb-3 overflow-x-auto pb-2 border-b border-white/10">
                {Object.keys(EMOJI_CATEGORIES).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      activeCategory === cat 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                {EMOJI_CATEGORIES[activeCategory].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleSelect(emoji)}
                    className="text-2xl hover:bg-white/10 rounded p-1 transition-colors flex items-center justify-center"
                  >
                    {customMap[emoji] ? (
                      <img src={customMap[emoji]} alt={emoji} className="w-7 h-7 object-contain" />
                    ) : (
                      emoji
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}