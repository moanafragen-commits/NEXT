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
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-xl max-h-[70vh] flex flex-col"
      >
        {/* Handle */}
        <div className="flex flex-col items-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <span className="text-sm font-semibold text-black">Kommentare</span>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {comments.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Noch keine Kommentare</p>
          )}
          {comments.map((comment) => {
            const commenter = getCommentAvatar(comment);
            return (
              <div key={comment.id} className="flex gap-3">
                {commenter.avatar ? (
                  <img src={commenter.avatar} alt={commenter.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-500 font-medium">{commenter.name[0].toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px]">
                    <span className="font-semibold text-black mr-1.5">
                      {commenter.name}
                      {commenter.isAI && <span className="ml-1 text-[10px] text-gray-400 font-normal">KI</span>}
                    </span>
                    <span className="text-gray-700">{comment.content}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(comment.created_date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Kommentar hinzufügen..."
            className="flex-1 bg-transparent text-black text-sm placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isSubmitting}
            className="text-blue-500 font-semibold text-sm disabled:opacity-30"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Posten'}
          </button>
        </div>
      </motion.div>
    </>
  );
}