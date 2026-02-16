import React, { useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFeedPosts, generatePostReactions } from './FeedGenerator';
import { toast } from 'sonner';

export default function GenerateFeedButton({ characters, messages, weatherState, onGenerated, userEmail }) {
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState('');

  const handleGenerate = async () => {
    if (!characters || characters.length === 0) {
      toast.error('Erstelle zuerst einen Charakter');
      return;
    }

    setGenerating(true);
    setStep('Interaktionen analysieren...');

    // Posts + automatic cross-reactions are now handled inside generateFeedPosts
    setStep('Posts & Reaktionen werden generiert...');
    const posts = await generateFeedPosts({
      characters,
      messages,
      weatherState,
      count: 3,
      userEmail
    });

    setGenerating(false);
    setStep('');
    onGenerated();
    toast.success(`${posts.length} neue Posts mit Reaktionen im Feed!`);
  };

  return (
    <div className="px-4 py-3 border-b border-white/[0.06]">
      <AnimatePresence mode="wait">
        {generating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-2"
          >
            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-5 py-3 border border-emerald-500/20">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span className="text-sm text-gray-300">{step}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Button
              onClick={handleGenerate}
              disabled={!characters?.length}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl gap-2 h-10"
            >
              <Wand2 className="w-4 h-4" />
              Feed generieren
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}