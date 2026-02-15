import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Eye, Heart, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function StatusInsightsSheet({ statusId, viewsCount, onClose }) {
  const [tab, setTab] = useState('reactions'); // 'reactions' or 'views'

  const { data: reactions = [], isLoading: loadingReactions } = useQuery({
    queryKey: ['status-reactions', statusId],
    queryFn: async () => {
      const allReactions = await base44.entities.StatusReaction.filter({ status_id: statusId }, '-created_date');
      const allUsers = await base44.entities.User.list();
      const userMap = {};
      allUsers.forEach(u => { userMap[u.email] = u; });
      return allReactions.map(r => ({
        ...r,
        user: userMap[r.user_email] || { email: r.user_email, full_name: r.user_email }
      }));
    },
    enabled: !!statusId
  });

  const { data: views = [], isLoading: loadingViews } = useQuery({
    queryKey: ['status-viewers', statusId],
    queryFn: async () => {
      const allViews = await base44.entities.StatusView.filter({ status_id: statusId });
      const allUsers = await base44.entities.User.list();
      const userMap = {};
      allUsers.forEach(u => { userMap[u.email] = u; });
      return allViews.map(v => ({
        ...v,
        user: userMap[v.user_email] || { email: v.user_email, full_name: v.user_email }
      }));
    },
    enabled: !!statusId
  });

  // Group reactions by emoji
  const emojiGroups = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const isLoading = tab === 'reactions' ? loadingReactions : loadingViews;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-[#1a1a1a] rounded-t-2xl max-h-[70vh] flex flex-col"
    >
      {/* Handle */}
      <div className="flex justify-center pt-2">
        <div className="w-10 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Header with tabs */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white text-lg">Status-Insights</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('reactions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'reactions' ? 'bg-emerald-600 text-white' : 'bg-[#262626] text-gray-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            Reaktionen ({reactions.length})
          </button>
          <button
            onClick={() => setTab('views')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'views' ? 'bg-emerald-600 text-white' : 'bg-[#262626] text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            Aufrufe ({viewsCount || 0})
          </button>
        </div>

        {/* Emoji summary */}
        {tab === 'reactions' && Object.keys(emojiGroups).length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {Object.entries(emojiGroups).sort((a, b) => b[1] - a[1]).map(([emoji, count]) => (
              <span key={emoji} className="bg-[#262626] px-2.5 py-1 rounded-full text-sm flex items-center gap-1">
                <span className="text-base">{emoji}</span>
                <span className="text-gray-400 text-xs">{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <p className="text-center text-gray-500 py-6">Laden...</p>
        ) : tab === 'reactions' ? (
          reactions.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Noch keine Reaktionen</p>
          ) : (
            reactions.map((reaction) => (
              <div key={reaction.id} className="flex items-center gap-3">
                <img
                  src={reaction.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reaction.user.email}`}
                  alt={reaction.user.full_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {reaction.user.display_name || reaction.user.full_name || reaction.user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(reaction.created_date), { addSuffix: true, locale: de })}
                  </p>
                </div>
                <span className="text-2xl">{reaction.emoji}</span>
              </div>
            ))
          )
        ) : (
          views.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Noch keine Aufrufe</p>
          ) : (
            views.map((view) => (
              <div key={view.id} className="flex items-center gap-3">
                <img
                  src={view.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${view.user.email}`}
                  alt={view.user.full_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {view.user.display_name || view.user.full_name || view.user.email}
                  </p>
                  <p className="text-xs text-gray-500">{view.user.email}</p>
                </div>
                <Eye className="w-4 h-4 text-gray-500" />
              </div>
            ))
          )
        )}
      </div>
    </motion.div>
  );
}