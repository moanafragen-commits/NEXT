import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Repeat2, BadgeCheck, ChevronDown, ChevronUp, Bookmark, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CATEGORY_COLORS = {
  breaking: 'bg-red-500/20 text-red-400 border-red-500/30',
  entertainment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  sport: 'bg-green-500/20 text-green-400 border-green-500/30',
  politik: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  wissenschaft: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  klatsch: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  wetter: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  gaming: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  musik: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
};

const CATEGORY_LABEL = {
  breaking: 'BREAKING', entertainment: 'Entertainment', sport: 'Sport', politik: 'Politik',
  wissenschaft: 'Wissenschaft', klatsch: 'Klatsch & Tratsch', wetter: 'Wetter', gaming: 'Gaming', musik: 'Musik'
};

function formatCount(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function getTimeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return 'Jetzt';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

export default function NewsArticleCard({ article, onMarkRead, onShare, characters = [], compact = false }) {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const likes = article.likes || [];
  const comments = article.comments || [];
  const sourceName = article.source_name || 'Breaking News';
  const isVerified = article.source_verified !== false;
  const catColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.entertainment;

  // Simulated high engagement for verified news sources
  const baseLikes = article.like_count || likes.length * 120 + Math.floor(Math.random() * 3000 + 500);
  const baseReposts = article.repost_count || Math.floor(baseLikes * 0.4);
  const displayLikes = baseLikes + (liked ? 1 : 0);
  const displayComments = comments.length > 0 ? comments.length * 8 + Math.floor(Math.random() * 50) : 0;

  // Find related characters
  const relatedCharIds = (article.related_character_ids || '').split(',').filter(Boolean);
  const relatedChars = relatedCharIds.map(id => characters.find(c => c.id === id)).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onClick={() => !article.is_read && onMarkRead?.(article.id)}
      className={`border-b border-white/[0.05] hover:bg-white/[0.02] transition-all duration-300 ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}
    >
      <div className="flex gap-3">
        {/* Source avatar */}
        <div className="flex-shrink-0">
          <div className={`${compact ? 'w-9 h-9' : 'w-11 h-11'} rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold ring-1 ring-white/10`}>
            <span className={compact ? 'text-base' : 'text-lg'}>{article.source_logo_emoji || article.emoji || '📰'}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header: Source name + verified + category + time */}
          <div className="flex items-center gap-1 mb-0.5">
            <span className={`${compact ? 'text-[13px]' : 'text-[15px]'} font-bold text-white truncate`}>{sourceName}</span>
            {isVerified && (
              <BadgeCheck className="w-4 h-4 flex-shrink-0 text-amber-500 fill-amber-500" />
            )}
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ml-1 ${catColor}`}>
              {CATEGORY_LABEL[article.category] || article.category}
            </span>
            {!article.is_read && (
              <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 ml-1" />
            )}
            <span className="text-gray-600 text-[13px] flex-shrink-0 ml-auto">· {getTimeAgo(article.created_date)}</span>
          </div>

          {/* Headline */}
          <h3 className={`${compact ? 'text-[13px]' : 'text-[15px]'} font-semibold text-white leading-snug mb-1`}>
            {article.category === 'breaking' && <span className="text-red-400">🔴 </span>}
            {article.headline}
          </h3>

          {/* Content text */}
          <p className={`${compact ? 'text-xs line-clamp-2' : 'text-[14px] line-clamp-3'} text-gray-400 leading-relaxed mb-2`}>
            {article.content}
          </p>

          {/* Related characters tags */}
          {relatedChars.length > 0 && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {relatedChars.map(char => (
                <Link
                  key={char.id}
                  to={createPageUrl(`Chat?characterId=${char.id}`)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
                >
                  <img src={char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`} alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span className="text-[11px] font-medium text-gray-300">{char.name}</span>
                  {(char.is_verified || ['Berühmtheit', 'Influencer', 'Sportler', 'Musiker', 'Politiker'].includes(char.category)) && (
                    <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500" />
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between max-w-[420px] -ml-2 mt-1">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 group transition-colors"
            >
              <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <MessageCircle className="w-[17px] h-[17px]" />
              </div>
              {displayComments > 0 && <span className="text-[13px]">{formatCount(displayComments)}</span>}
            </button>

            <button className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-500 group transition-colors">
              <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                <Repeat2 className="w-[17px] h-[17px]" />
              </div>
              {baseReposts > 0 && <span className="text-[13px]">{formatCount(baseReposts)}</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
              className={`flex items-center gap-1.5 group transition-colors ${liked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${liked ? '' : 'group-hover:bg-pink-500/10'}`}>
                <Heart className={`w-[17px] h-[17px] transition-transform ${liked ? 'fill-pink-500 scale-110' : 'group-hover:scale-110'}`} />
              </div>
              <span className="text-[13px]">{formatCount(displayLikes)}</span>
            </button>

            <div className="flex items-center gap-0">
              <button
                onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
                className={`p-1.5 rounded-full transition-colors ${saved ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10'}`}
              >
                <Bookmark className={`w-[17px] h-[17px] ${saved ? 'fill-amber-400' : ''}`} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onShare?.(article); }}
                className="p-1.5 rounded-full text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <Share2 className="w-[17px] h-[17px]" />
              </button>
            </div>
          </div>

          {/* Top comment previews (always show top 2) */}
          {comments.length > 0 && !showComments && (
            <div className="mt-2 space-y-1.5">
              {comments.slice(0, 1).map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] text-gray-400 font-bold">{c.character_name?.[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-gray-300 mr-1">{c.character_name}</span>
                    {c.is_verified && <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500 inline" />}
                    <span className="text-[11px] text-gray-500 ml-1">{c.content}</span>
                  </div>
                </div>
              ))}
              {comments.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 ml-7"
                >
                  Alle {comments.length} Kommentare anzeigen
                </button>
              )}
            </div>
          )}

          {/* Full comments section */}
          <AnimatePresence>
            {showComments && comments.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2 pt-2 border-t border-white/[0.05]"
              >
                <div className="space-y-2.5">
                  {comments.map((c, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] text-gray-400 font-bold">{c.character_name?.[0]}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-white">{c.character_name}</span>
                          {c.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />}
                          <span className="text-[10px] text-gray-600">· {c.timestamp ? getTimeAgo(c.timestamp) : ''}</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowComments(false); }}
                  className="text-[11px] text-gray-500 hover:text-gray-400 mt-2 flex items-center gap-1"
                >
                  <ChevronUp className="w-3 h-3" /> Kommentare ausblenden
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}