import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function FeedPostCard({ post, character, isLiked, onLike, onOpenComments, commentsCount, allCharacters }) {
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character?.name}`;
  const timeAgo = getTimeAgo(post.created_date);
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
            src={character?.avatar_url || defaultAvatar}
            alt={character?.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 mb-0.5">
            <Link to={createPageUrl(`Chat?characterId=${character?.id}`)} className="flex items-center gap-1 min-w-0">
              <span className="text-[15px] font-bold truncate">{character?.name}</span>
              {isVerified && (
                <BadgeCheck className={`w-[18px] h-[18px] flex-shrink-0 ${isNews ? 'text-amber-500 fill-amber-500' : isPublicFigure ? 'text-purple-500 fill-purple-500' : 'text-blue-500 fill-blue-500'}`} />
              )}
            </Link>
            <span className="text-gray-600 text-[13px] flex-shrink-0">· {timeAgo}</span>
            <div className="ml-auto flex-shrink-0">
              <button className="text-gray-600 hover:text-gray-400 p-1 -mr-1 rounded-full hover:bg-white/5 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Handle */}
          <p className="text-gray-600 text-[13px] -mt-0.5 mb-1.5">
            @{(character?.name || '').toLowerCase().replace(/\s+/g, '_')}
          </p>

          {/* Text content */}
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-2 text-gray-100">
            {post.content}
          </p>

          {/* Optional image */}
          {post.image_url && (
            <div className="rounded-2xl overflow-hidden border border-white/10 mb-2">
              <img
                src={post.image_url}
                alt=""
                className="w-full max-h-80 object-cover"
              />
            </div>
          )}

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
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-400 group transition-colors">
              <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                <Repeat2 className="w-[18px] h-[18px]" />
              </div>
              {displayRetweets > 0 && <span className="text-[13px]">{formatCount(displayRetweets)}</span>}
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