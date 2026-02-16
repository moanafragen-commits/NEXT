import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import DynamicEventCard from './DynamicEventCard';
import { checkAndGenerateDynamicEvent, resolveEvent } from './DynamicEventSystem';
import { useUserLevel } from '@/components/gamification/useUserLevel';

export default function DynamicEventFeed({ userEmail }) {
  const queryClient = useQueryClient();
  const [initialized, setInitialized] = useState(false);
  const { userLevelData, addXP } = useUserLevel(userEmail);

  const { data: events = [] } = useQuery({
    queryKey: ['dynamic-events', userEmail],
    queryFn: async () => {
      const all = await base44.entities.DynamicEvent.filter({ user_email: userEmail }, '-created_date', 10);
      const now = new Date();
      return all.filter(e => e.status === 'active' && (!e.expires_at || new Date(e.expires_at) > now));
    },
    enabled: !!userEmail
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['user-jobs', userEmail],
    queryFn: () => base44.entities.UserJob.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 100)
  });

  // Try generating events on mount (once)
  useEffect(() => {
    if (!userEmail || initialized || characters.length === 0) return;
    setInitialized(true);

    const timer = setTimeout(async () => {
      await checkAndGenerateDynamicEvent({
        userEmail,
        characters,
        jobs,
        messages,
        userLevel: userLevelData
      });
      queryClient.invalidateQueries({ queryKey: ['dynamic-events', userEmail] });
    }, 3000);

    return () => clearTimeout(timer);
  }, [userEmail, characters.length, initialized]);

  const handleResolve = async (eventId, choiceIndex) => {
    const result = await resolveEvent(eventId, choiceIndex, addXP);
    queryClient.invalidateQueries({ queryKey: ['dynamic-events', userEmail] });
    return result;
  };

  const handleDismiss = async (eventId) => {
    await base44.entities.DynamicEvent.update(eventId, { status: 'dismissed' });
    queryClient.invalidateQueries({ queryKey: ['dynamic-events', userEmail] });
  };

  if (events.length === 0) return null;

  return (
    <div className="px-4 py-2 space-y-3">
      <AnimatePresence>
        {events.map(event => {
          const char = characters.find(c => c.id === event.related_character_id);
          return (
            <DynamicEventCard
              key={event.id}
              event={event}
              character={char}
              onResolve={handleResolve}
              onDismiss={handleDismiss}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}