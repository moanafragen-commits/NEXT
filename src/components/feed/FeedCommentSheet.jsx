import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Loader2, Send, Heart, BadgeCheck } from 'lucide-react';

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

export default function FeedCommentSheet({ post, character, comments, user, onClose, onSubmitComment, isSubmitting }) {
  const [text, setText] = useState('');
  const [likedComments, setLikedComments] = useState(new Set());
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const { data: aiCharacters = [] } = useQuery({
    queryKey: ['ai-characters'],
    queryFn: () => base44.entities.AICharacter.list()
  });

  // Build a combined map: character ID -> { name, avatar, category }
  const charMap = {};
  for (const c of characters) {
    charMap[c.id] = c;
  }
  for (const c of aiCharacters) {
    charMap[c.id] = {
      id: c.id,
      name: c.name,
      avatar_url: c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.username || c.name}`,
      category: c.category === 'lifestyle' ? 'Influencer' : c.category === 'tech' ? 'Wissenschaftler' : 'Andere',
      username: c.username
    };
  }

  useEffect(() => {
    // Focus input when sheet opens
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  useEffect(() => {
    // Scroll to bottom on new comments
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSubmitComment(text.trim());
    setText('');
  };

  const toggleLike = (commentId) => {
    setLikedComments(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const getCommenter = (comment) => {
    // Check if the comment was written by the current logged-in user
    const isCurrentUser = comment.user_email === user?.email;
    if (isCurrentUser) {
      const name = user?.display_name || user?.full_name || 'Du';
      return {
        name,
        username: '@' + name.toLowerCase().replace(/\s+/g, '_'),
        avatar: user?.avatar_url || null,
        isAI: false,
        isVerified: false
      };
    }
    // Check if this comment was written by an AI character (user_email = character_id)
    const char = charMap[comment.user_email];
    if (char) {
      const verifiedCats = ['Berühmtheit', 'Nachrichtensender', 'Influencer', 'Sportler', 'Musiker', 'Politiker', 'Wissenschaftler', 'Künstler', 'Unternehmer', 'Streamer', 'Model', 'Journalist', 'Aktivist'];
      const isVerified = verifiedCats.includes(char.category);
      return {
        name: char.name,
        username: '@' + (char.username || char.name || '').toLowerCase().replace(/\s+/g, '_'),
        avatar: char.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.name}`,
        isAI: true,
        isVerified,
        category: char.category
      };
    }
    // Fallback
    const email = comment.user_email || '';
    const fallbackName = email.includes('@') ? email.split('@')[0] : 'KI-Nutzer';
    return {
      name: fallbackName,
      username: '@' + fallbackName.toLowerCase().replace(/\s+/g, '_'),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      isAI: true,
      isVerified: false
    };
  };

  const isVerifiedChar = ['Berühmtheit', 'Nachrichtensender', 'Influencer', 'Sportler', 'Musiker', 'Politiker', 'Wissenschaftler', 'Künstler', 'Unternehmer', 'Streamer', 'Model', 'Journalist', 'Aktivist'].includes(character?.category);

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
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-2xl max-h-[80vh] flex flex-col border-t border-white/[0.08]"
      >
        {/* Handle */}
        <div className="flex flex-col items-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header with post preview */}
        <div className="px-4 py-2 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white">Kommentare</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          {/* Mini post preview */}
          <div className="flex items-start gap-2 pb-2">
            <img
              src={character?.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character?.name}`}
              alt=""
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-white truncate">{character?.name}</span>
                {isVerifiedChar && <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500 flex-shrink-0" />}
              </div>
              <p className="text-[11px] text-gray-500 line-clamp-1">{post.content}</p>
            </div>
          </div>
        </div>

        {/* Comments list */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {comments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">Noch keine Kommentare</p>
              <p className="text-gray-600 text-xs mt-1">Starte die Konversation</p>
            </div>
          )}
          {comments.map((comment) => {
            const commenter = getCommenter(comment);
            const isLiked = likedComments.has(comment.id);
            return (
              <div key={comment.id} className="flex gap-3 group">
                {commenter.avatar ? (
                  <img src={commenter.avatar} alt={commenter.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-400 font-medium">{commenter.name[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[13px] font-semibold text-white">{commenter.name}</span>
                    {commenter.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500 flex-shrink-0" />}
                    <span className="text-[11px] text-gray-600">{commenter.username}</span>
                    <span className="text-[11px] text-gray-600">· {getTimeAgo(comment.created_date)}</span>
                  </div>
                  <p className="text-[13px] text-gray-300 leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-1.5">
                    <button
                      onClick={() => toggleLike(comment.id)}
                      className={`flex items-center gap-1 text-[11px] transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'}`}
                    >
                      <Heart className={`w-3 h-3 ${isLiked ? 'fill-pink-500' : ''}`} />
                      {isLiked && <span>1</span>}
                    </button>
                    <button
                      onClick={() => {
                        setText(`@${commenter.name.toLowerCase().replace(/\s+/g, '_')} `);
                        inputRef.current?.focus();
                      }}
                      className="text-[11px] text-gray-600 hover:text-white transition-colors"
                    >
                      Antworten
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-3 bg-[#151515]">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-gray-400 font-medium">{(user?.full_name || 'U')[0].toUpperCase()}</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Kommentar schreiben..."
            className="flex-1 bg-[#262626] text-white text-sm placeholder-gray-500 px-4 py-2.5 rounded-full border border-white/[0.06] focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isSubmitting}
            className="p-2 rounded-full bg-emerald-500 disabled:bg-white/10 disabled:opacity-40 transition-all hover:bg-emerald-400"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}