import React, { useMemo, useState } from 'react';
import { TrendingUp, X, Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getTodaysTrends } from './FeedGenerator';
import { AnimatePresence, motion } from 'framer-motion';

export default function TrendingSidebar({ activeTrend, onTrendClick, posts = [], likes = [], comments = [], characters = [], getCharacter }) {
  const trends = getTodaysTrends();
  const [expandedTrend, setExpandedTrend] = useState(null);
  
  // Match posts to trends
  const trendData = useMemo(() => {
    return trends.map(trend => {
      const keywords = trend.toLowerCase().split(/[\s\-]+/).filter(kw => kw.length > 3);
      const matchingPosts = posts.filter(p => {
        const content = (p.content || '').toLowerCase();
        return keywords.some(kw => content.includes(kw));
      });
      const totalLikes = matchingPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const totalComments = matchingPosts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
      return { trend, posts: matchingPosts, totalLikes, totalComments };
    });
  }, [trends.join(','), posts]);

  const handleTrendClick = (trend) => {
    if (expandedTrend === trend) {
      setExpandedTrend(null);
    } else {
      setExpandedTrend(trend);
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h3 className="text-[15px] font-bold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Trends für dich
        </h3>
        {activeTrend && (
          <button
            onClick={() => { onTrendClick?.(null); setExpandedTrend(null); }}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-full transition-colors"
          >
            <X className="w-3 h-3" />
            Filter löschen
          </button>
        )}
      </div>
      <div>
        {trendData.map(({ trend, posts: trendPosts, totalLikes, totalComments }, i) => {
          const isActive = activeTrend === trend;
          const isExpanded = expandedTrend === trend;
          return (
            <div key={i}>
              <button
                onClick={() => handleTrendClick(trend)}
                className={`w-full text-left px-4 py-2.5 transition-colors ${
                  isActive 
                    ? 'bg-emerald-500/10 border-l-2 border-emerald-500' 
                    : 'hover:bg-white/[0.03] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-gray-500">Trending</p>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                </div>
                <p className={`text-[14px] font-semibold ${isActive ? 'text-emerald-400' : 'text-white'}`}>{trend}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[11px] text-gray-500">{trendPosts.length} Posts</span>
                  {totalLikes > 0 && (
                    <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
                      <Heart className="w-3 h-3" /> {totalLikes}
                    </span>
                  )}
                  {totalComments > 0 && (
                    <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
                      <MessageCircle className="w-3 h-3" /> {totalComments}
                    </span>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && trendPosts.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-white/[0.04]"
                  >
                    <div className="px-3 py-2 space-y-2 bg-white/[0.02]">
                      {trendPosts.slice(0, 5).map(post => {
                        const char = getCharacter?.(post.character_id);
                        const avatar = post.is_user_post 
                          ? (post.user_avatar_url || '') 
                          : (char?.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${post.character_id}`);
                        const name = post.is_user_post
                          ? (post.user_display_name || 'Du')
                          : (char?.name || 'Unbekannt');

                        return (
                          <div 
                            key={post.id} 
                            onClick={() => onTrendClick?.(isActive ? null : trend)}
                            className="flex gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors cursor-pointer"
                          >
                            <img 
                              src={avatar} 
                              alt="" 
                              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-white truncate">{name}</span>
                                {char?.is_verified && <span className="text-[10px]">✓</span>}
                              </div>
                              <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">{post.content}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                                  <Heart className={`w-3 h-3 ${post.likes_count > 0 ? 'text-pink-400' : ''}`} /> {post.likes_count || 0}
                                </span>
                                <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                                  <MessageCircle className="w-3 h-3" /> {post.comments_count || 0}
                                </span>
                                <span className="text-[10px] text-gray-600 ml-auto">
                                  {new Date(post.created_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {trendPosts.length > 5 && (
                        <p className="text-[10px] text-gray-500 text-center py-1">
                          +{trendPosts.length - 5} weitere Posts
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
                {isExpanded && trendPosts.length === 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[11px] text-gray-600 text-center py-3 bg-white/[0.02]">
                      Noch keine Posts zu diesem Trend
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}