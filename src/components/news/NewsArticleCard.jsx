import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_EMOJI = {
  breaking: '🔴', entertainment: '🎬', sport: '⚽', politik: '🏛️',
  wissenschaft: '🔬', klatsch: '💬', wetter: '🌤️', gaming: '🎮', musik: '🎵'
};

export default function NewsArticleCard({ article, onMarkRead, onShare }) {
  const [showComments, setShowComments] = useState(false);
  const likes = article.likes || [];
  const comments = article.comments || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => !article.is_read && onMarkRead?.(article.id)}
      className={`rounded-xl border transition-all ${
        article.is_read 
          ? 'bg-white/[0.02] border-white/5' 
          : 'bg-white/5 border-emerald-500/20 glow-emerald'
      }`}
    >
      {/* Main content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{article.emoji || CATEGORY_EMOJI[article.category] || '📰'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 uppercase">
                {article.category}
              </span>
              {!article.is_read && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </div>
            <h3 className="font-semibold text-sm text-white">{article.headline}</h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-3">{article.content}</p>
            <p className="text-[10px] text-gray-600 mt-2">
              {new Date(article.created_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Reactions bar */}
      <div className="px-4 pb-3 flex items-center gap-4 border-t border-white/[0.04] pt-2.5">
        {/* Likes */}
        <div className="flex items-center gap-1.5">
          <Heart className={`w-4 h-4 ${likes.length > 0 ? 'text-red-400 fill-red-400' : 'text-gray-600'}`} />
          <span className="text-xs text-gray-400">
            {likes.length > 0 ? (
              article.like_names ? article.like_names.split(', ').slice(0, 2).join(', ') + (likes.length > 2 ? ` +${likes.length - 2}` : '') : likes.length
            ) : '0'}
          </span>
        </div>

        {/* Comments toggle */}
        {comments.length > 0 && (
          <button 
            onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-400">{comments.length}</span>
            {showComments ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
          </button>
        )}

        {/* Share button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onShare?.(article); }}
          className="flex items-center gap-1.5 ml-auto hover:text-emerald-400 transition-colors"
        >
          <Share2 className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">Teilen</span>
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && comments.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/[0.04]"
          >
            <div className="px-4 py-3 space-y-3">
              {comments.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] text-emerald-400 font-bold">{c.character_name?.[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-emerald-400/80">{c.character_name}</span>
                    <p className="text-xs text-gray-300 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}