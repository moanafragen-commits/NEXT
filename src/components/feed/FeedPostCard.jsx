import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, BadgeCheck, Bot, Loader2, Trash2, Pencil, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { generatePostReactions } from './FeedGenerator';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createNotification } from '@/components/notifications/NotificationHelper';

// Stable fallback names/avatars for posts without a real character
const FALLBACK_PROFILES = [
  { name: 'Luna Sternfeld', seed: 'luna_sternfeld' },
  { name: 'Max Richter', seed: 'max_richter' },
  { name: 'Elisa Wunderlich', seed: 'elisa_wunderlich' },
  { name: 'Jonas Berger', seed: 'jonas_berger' },
  { name: 'Mila Nordwind', seed: 'mila_nordwind' },
  { name: 'Finn Schattenberg', seed: 'finn_schattenberg' },
  { name: 'Sophie Lichtblick', seed: 'sophie_lichtblick' },
  { name: 'Nico Falkenstein', seed: 'nico_falkenstein' },
  { name: 'Lena Morgentau', seed: 'lena_morgentau' },
  { name: 'Tim Wolkenfrei', seed: 'tim_wolkenfrei' },
];

function getFallbackProfile(postId) {
  // Deterministic: same post always gets same fallback
  let hash = 0;
  for (let i = 0; i < (postId || '').length; i++) {
    hash = ((hash << 5) - hash) + postId.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % FALLBACK_PROFILES.length;
  const fb = FALLBACK_PROFILES[idx];
  return {
    name: fb.name,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fb.seed}`,
  };
}

export default function FeedPostCard({ post, character, isLiked, onLike, onOpenComments, commentsCount, allCharacters, onRepost, currentUser, onDelete, onEdit }) {
  const isUserPost = post.is_user_post;
  const isRealChar = !isUserPost && character && character.name && character.name !== 'Unbekannt';
  const fallback = (!isRealChar && !isUserPost) ? getFallbackProfile(post.id) : null;

  const charName = isUserPost
    ? (post.user_display_name || currentUser?.display_name || currentUser?.full_name || 'Du')
    : isRealChar ? character.name : fallback.name;
  const charAvatar = isUserPost
    ? (post.user_avatar_url || currentUser?.avatar_url || '')
    : isRealChar ? (character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${charName}`) : fallback.avatar_url;
  const charUsername = '@' + charName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_äöüß]/g, '');
  const timeAgo = getTimeAgo(post.created_date);
  const [reactLoading, setReactLoading] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const menuRef = useRef(null);
  const queryClient = useQueryClient();
  
  const isOwnPost = post.is_user_post && post.created_by === currentUser?.email;

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

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
      // Notify post owner
      if (post.created_by && currentUser && post.created_by !== currentUser.email) {
        createNotification({
          recipientEmail: post.created_by,
          type: 'repost',
          actorName: currentUser.display_name || currentUser.full_name || 'Jemand',
          actorAvatar: currentUser.avatar_url || '',
          actorUsername: '@' + (currentUser.display_name || currentUser.full_name || 'user').toLowerCase().replace(/\s+/g, '_'),
          postId: post.id,
          postPreview: post.content
        });
      }
    }
  };

  const isCelebrity = character?.category === 'Berühmtheit';
  const isNews = character?.category === 'Nachrichtensender';
  const isPublicFigure = ['Influencer', 'Sportler', 'Musiker', 'Politiker', 'Wissenschaftler', 'Künstler', 'Unternehmer', 'Streamer', 'Model', 'Journalist', 'Aktivist'].includes(character?.category);
  const isVerified = character?.is_verified || isCelebrity || isNews || isPublicFigure;

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
        {isUserPost ? (
          <div className="flex-shrink-0">
            {charAvatar ? (
              <img src={charAvatar} alt={charName} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold ring-1 ring-white/10">
                {charName[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        ) : (
          <Link to={createPageUrl(`Chat?characterId=${character?.id}`)} className="flex-shrink-0">
            <img src={charAvatar} alt={charName} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" />
          </Link>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row: Name + verified + @handle + time */}
          <div className="flex items-center gap-1 mb-1">
            {isUserPost ? (
              <span className="flex items-center gap-1 min-w-0">
                <span className="text-[15px] font-bold truncate text-white">{charName}</span>
              </span>
            ) : (
              <Link to={createPageUrl(`Chat?characterId=${character?.id}`)} className="flex items-center gap-1 min-w-0">
                <span className="text-[15px] font-bold truncate text-white">{charName}</span>
                {isVerified && !character?.is_band_account && (
                  <BadgeCheck className={`w-[16px] h-[16px] flex-shrink-0 ${isNews ? 'text-amber-500 fill-amber-500' : isPublicFigure ? 'text-purple-500 fill-purple-500' : 'text-blue-500 fill-blue-500'}`} />
                )}
                {character?.is_band_account && (
                  <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-bold tracking-wider">
                    OFFICIAL BAND
                  </span>
                )}
              </Link>
            )}
            {post.is_hype_post && (
              <span className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-bold tracking-wider">
                HYPE
              </span>
            )}
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
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                  className="text-gray-600 hover:text-gray-400 p-1 -mr-1 rounded-full hover:bg-white/5 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && isOwnPost && (
                  <div className="absolute right-0 top-8 bg-[#262626] border border-white/10 rounded-xl shadow-xl z-20 min-w-[160px] py-1 overflow-hidden">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditText(post.content); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Bearbeiten
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm('Post wirklich löschen?')) { onDelete?.(post.id); } setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Löschen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Text content */}
          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={280}
                rows={3}
                className="w-full bg-[#262626] text-white text-[15px] rounded-lg p-3 border border-white/10 focus:border-emerald-500/50 outline-none resize-none leading-relaxed"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{editText.length}/280</span>
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { onEdit?.(post.id, editText.trim()); setIsEditing(false); }}
                    disabled={!editText.trim()}
                    className="p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-2 text-gray-100">
              {post.content}
            </p>
          )}

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
              <span className="text-[13px]">{commentsCount > 0 ? formatCount(commentsCount) : '0'}</span>
            </button>

            {/* Retweets */}
            <button 
              onClick={handleRepost}
              className={`flex items-center gap-1.5 group transition-colors ${reposted ? 'text-emerald-500' : 'text-gray-500 hover:text-emerald-500'}`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${reposted ? 'bg-emerald-500/10' : 'group-hover:bg-emerald-500/10'}`}>
                <Repeat2 className={`w-[18px] h-[18px] ${reposted ? 'text-emerald-500' : ''}`} />
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