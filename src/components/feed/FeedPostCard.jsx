import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, BadgeCheck, Bot, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { generatePostReactions } from './FeedGenerator';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function FeedPostCard({ post, character, isLiked, onLike, onOpenComments, commentsCount, allCharacters, onRepost }) {
  const charName = character?.name || 'Unbekannt';
  const charAvatar = character?.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${charName}`;
  const charUsername = '@' + charName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_äöüß]/g, '');
  const timeAgo = getTimeAgo(post.created_date);
  const [reactLoading, setReactLoading] = useState(false);
  const [reposted, setReposted] = useState(false);
  const queryClient = useQueryClient();

  const handleAIReact = async (e) => {
    e.stopPropagation();
    if (reactLoading || !allCharacters?.length) return;
    setReactLoading(true);
    const count = await generatePostReactions(post, character, allCharacters);
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['likes'] });
    queryClient.invalidateQueries({ queryKey: ['comments'] });
    if (count > 0) toast.success(`${count} Reaktion${count > 1 ? 'en' : ''}!`);
    setReactLoading(false);
  };

  const handleRepost = () => {
    setReposted(!reposted);
    if (!reposted) {
      toast.success('Repostet!');
      if (onRepost) onRepost(post);
    }
  };

  const isCelebrity = character?.category === 'Berühmtheit';
  const isNews = character?.category === 'Nachrichtensender';
  const isPublicFigure = ['Influencer', 'Sportler', 'Musiker', 'Politiker', 'Wissenschaftler', 'Künstler', 'Unternehmer', 'Streamer', 'Model', 'Journalist', 'Aktivist'].includes(character?.category);
  const isVerified = isCelebrity || isNews || isPublicFigure;

  // Celebrities & news get higher engagement numbers
  const displayLikes = isVerified 
    ? Math.max(post.likes_count || 0, Math.floor(Math.random() * (isNews ? 8000 : 5000) + (isNews ? 2000 : 1200)))
    : (post.likes_count || 0);
  
  const displayRetweets = isVerified
    ? Math.floor(displayLikes * (isNews ? 0.6 : 0.3))
    : Math.floor((post.likes_count || 0) * 0.1);

  const formatCount = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="border-b border-white/[0.05] px-4 py-3 hover:bg-white/[0.02] transition-all duration-300 auto-theme-card"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Link to={createPageUrl(`Chat?characterId=${character?.id}`)} className="flex-shrink-0">
          <img
            src={charAvatar}
            alt={charName}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row: Name + verified + @handle + time */}
          <div className="flex items-center gap-1 mb-1">
            <Link to={createPageUrl(`Chat?characterId=${character?.id}`)} className="flex items-center gap-1 min-w-0">
              <span className="text-[15px] font-bold truncate text-white">{charName}</span>
              {isVerified && (
                <BadgeCheck className={`w-[16px] h-[16px] flex-shrink-0 ${isNews ? 'text-amber-500 fill-amber-500' : isPublicFigure ? 'text-purple-500 fill-purple-500' : 'text-blue-500 fill-blue-500'}`} />
              )}
            </Link>
            <span className="text-gray-500 text-[13px] truncate">{charUsername}</span>
            <span className="text-gray-600 text-[13px] flex-shrink-0">· {timeAgo}</span>
            <div className="ml-auto flex-shrink-0 flex items-center gap-1">
              <button
                onClick={handleAIReact}
                disabled={reactLoading}
                className="text-gray-600 hover:text-emerald-400 p-1 rounded-full hover:bg-emerald-500/10 transition-colors"
                title="KI-Charaktere reagieren lassen"
              >
                {reactLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
              </button>
              <button className="text-gray-600 hover:text-gray-400 p-1 -mr-1 rounded-full hover:bg-white/5 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text content */}
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-2 text-gray-100">
            {post.content}
          </p>

          {/* Images disabled */}

          {/* Actions */}
          <div className="flex items-center justify-between max-w-[400px] -ml-2 mt-1">
            {/* Comments */}
            <button 
              onClick={onOpenComments}
              className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 group transition-colors"
            >
              <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <MessageCircle className="w-[18px] h-[18px]" />
              </div>
              {commentsCount > 0 && <span className="text-[13px]">{formatCount(commentsCount)}</span>}
            </button>

            {/* Retweets */}
            <button 
              onClick={handleRepost}
              className={`flex items-center gap-1.5 group transition-colors ${reposted ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${reposted ? '' : 'group-hover:bg-emerald-500/10'}`}>
                <Repeat2 className="w-[18px] h-[18px]" />
              </div>
              {(displayRetweets + (reposted ? 1 : 0)) > 0 && <span className="text-[13px]">{formatCount(displayRetweets + (reposted ? 1 : 0))}</span>}
            </button>

            {/* Likes */}
            <button 
              onClick={onLike}
              className={`flex items-center gap-1.5 group transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isLiked ? '' : 'group-hover:bg-pink-500/10'}`}>
                <Heart className={`w-[18px] h-[18px] transition-transform ${isLiked ? 'fill-pink-500 scale-110' : 'group-hover:scale-110'}`} />
              </div>
              <span className="text-[13px]">{formatCount(displayLikes)}</span>
            </button>

            {/* Share */}
            <button className="flex items-center text-gray-500 hover:text-blue-400 group transition-colors">
              <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <Share className="w-[18px] h-[18px]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Jetzt';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}