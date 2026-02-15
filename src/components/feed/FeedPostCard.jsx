import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import AIReactButton from '@/components/feed/AIReactButton';

export default function FeedPostCard({ post, character, isLiked, onLike, onOpenComments, commentsCount, allCharacters }) {
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const [saved, setSaved] = useState(false);

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character?.name}`;
  const timeAgo = getTimeAgo(post.created_date);

  const handleDoubleClick = () => {
    if (!isLiked) onLike();
    setDoubleTapHeart(true);
    setTimeout(() => setDoubleTapHeart(false), 1000);
  };

  return (
    <div className="bg-white border-b border-gray-100 auto-theme-card">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <Link to={createPageUrl(`Chat?characterId=${character?.id}`)} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full ring-[1.5px] ring-gray-200 overflow-hidden">
            <img
              src={character?.avatar_url || defaultAvatar}
              alt={character?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[13px] font-semibold">{character?.name}</span>
        </Link>
        <button className="text-gray-500 hover:text-black">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div className="relative" onDoubleClick={handleDoubleClick}>
        <img
          src={post.image_url}
          alt={post.content}
          className="w-full aspect-square object-cover"
        />
        {doubleTapHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={onLike} className="hover:opacity-60 transition-opacity">
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button onClick={onOpenComments} className="hover:opacity-60 transition-opacity">
              <MessageCircle className="w-6 h-6" />
            </button>
            <Link to={createPageUrl(`Chat?characterId=${character?.id}`)}>
              <Send className="w-5 h-5 hover:opacity-60 transition-opacity" />
            </Link>
            <AIReactButton post={post} postCharacter={character} allCharacters={allCharacters || []} />
          </div>
          <button onClick={() => setSaved(!saved)} className="hover:opacity-60 transition-opacity">
            <Bookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Likes */}
        <p className="text-[13px] font-semibold mb-1">
          {post.likes_count || 0} Gefällt mir
        </p>

        {/* Caption */}
        <div className="text-[13px] mb-1">
          <span className="font-semibold mr-1.5">{character?.name}</span>
          {post.content}
        </div>

        {/* Comments preview */}
        {(commentsCount > 0) && (
          <button onClick={onOpenComments} className="text-[13px] text-gray-400 mb-1">
            Alle {commentsCount} Kommentare ansehen
          </button>
        )}

        {/* Time */}
        <p className="text-[10px] text-gray-400 uppercase mt-1">{timeAgo}</p>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Gerade eben';
  if (diffMin < 60) return `Vor ${diffMin} Min.`;
  if (diffH < 24) return `Vor ${diffH} Std.`;
  if (diffD < 7) return `Vor ${diffD} Tag${diffD > 1 ? 'en' : ''}`;
  return new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}