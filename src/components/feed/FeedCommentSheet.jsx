import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

export default function FeedCommentSheet({ post, character, comments, user, onClose, onSubmitComment, isSubmitting }) {
  const [text, setText] = useState('');

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const charMap = Object.fromEntries(characters.map(c => [c.id, c]));

  const handleSend = () => {
    if (!text.trim()) return;
    onSubmitComment(text.trim());
    setText('');
  };

  const getCommentAvatar = (comment) => {
    // Check if user_email is actually a character ID
    const char = charMap[comment.user_email];
    if (char) {
      return {
        name: char.name,
        avatar: char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`,
        isAI: true
      };
    }
    return {
      name: comment.user_email?.split('@')[0] || 'Du',
      avatar: null,
      isAI: false
    };
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-2xl max-h-[70vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-sm font-semibold text-white">Kommentare</span>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {comments.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">Noch keine Kommentare. Sei der Erste!</p>
          )}
          {comments.map((comment) => {
            const commenter = getCommentAvatar(comment);
            return (
              <div key={comment.id} className="flex gap-3">
                {commenter.avatar ? (
                  <img src={commenter.avatar} alt={commenter.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-300">{commenter.name[0].toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-semibold text-white mr-1.5">
                      {commenter.name}
                      {commenter.isAI && <span className="ml-1 text-[10px] text-purple-400 font-normal">KI</span>}
                    </span>
                    <span className="text-gray-300">{comment.content}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {new Date(comment.created_date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Kommentar hinzufügen..."
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isSubmitting}
            className="text-emerald-400 font-semibold text-sm disabled:opacity-30"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Posten'}
          </button>
        </div>
      </motion.div>
    </>
  );
}