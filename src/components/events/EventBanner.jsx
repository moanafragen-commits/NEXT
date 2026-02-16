import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function EventBanner({ userEmail }) {
  const { data: events = [] } = useQuery({
    queryKey: ['active-events', userEmail],
    queryFn: async () => {
      const all = await base44.entities.CharacterEvent.filter({ user_email: userEmail, is_active: true }, '-created_date', 10);
      return all.filter(e => !e.expires_at || new Date(e.expires_at) > new Date());
    },
    enabled: !!userEmail,
    refetchInterval: 60000
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  if (events.length === 0) return null;

  const impactColors = {
    positive: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30',
    negative: 'from-red-600/20 to-orange-600/20 border-red-500/30',
    neutral: 'from-blue-600/20 to-purple-600/20 border-blue-500/30',
  };

  return (
    <div className="px-4 py-2 space-y-2">
      {events.slice(0, 3).map((event, i) => {
        const char = characters.find(c => c.id === event.character_id);
        if (!char) return null;
        const colors = impactColors[event.impact] || impactColors.neutral;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={createPageUrl(`Chat?characterId=${event.character_id}`)}
              className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${colors} border backdrop-blur-sm hover:scale-[1.02] transition-transform`}
            >
              <img
                src={char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{event.emoji} {event.title}</p>
                <p className="text-xs text-gray-400 truncate">{event.description}</p>
              </div>
              <span className="text-xs text-gray-500">
                {event.expires_at ? `${Math.max(0, Math.round((new Date(event.expires_at) - new Date()) / 3600000))}h` : ''}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}