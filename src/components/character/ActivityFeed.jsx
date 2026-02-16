import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Briefcase, Users, Gamepad2, Coffee, Heart, Bed, Compass, Brain, Loader2 } from 'lucide-react';
import moment from 'moment';

const activityIcons = {
  routine: <Coffee className="w-3.5 h-3.5" />,
  npc_interaction: <Users className="w-3.5 h-3.5" />,
  hobby: <Gamepad2 className="w-3.5 h-3.5" />,
  work: <Briefcase className="w-3.5 h-3.5" />,
  social: <Heart className="w-3.5 h-3.5" />,
  rest: <Bed className="w-3.5 h-3.5" />,
  adventure: <Compass className="w-3.5 h-3.5" />,
  emotional: <Brain className="w-3.5 h-3.5" />
};

export default function ActivityFeed({ characterId }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['character-activities', characterId],
    queryFn: () => base44.entities.CharacterActivity.filter({ character_id: characterId }, '-created_date', 10),
    enabled: !!characterId
  });

  if (isLoading) return <Loader2 className="w-4 h-4 animate-spin text-gray-500 mx-auto" />;
  if (activities.length === 0) return <p className="text-xs text-gray-600 text-center">Noch keine Aktivitäten.</p>;

  return (
    <div className="space-y-2">
      {activities.slice(0, 6).map(activity => (
        <div key={activity.id} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-[#1a1a1a] border border-white/5">
          <div className="mt-0.5 text-emerald-400">
            {activityIcons[activity.activity_type] || <Coffee className="w-3.5 h-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300">{activity.description}</p>
            <div className="flex items-center gap-2 mt-1">
              {activity.npc_involved && (
                <span className="text-xs text-purple-400">mit {activity.npc_involved}</span>
              )}
              <span className="text-xs text-gray-600">{moment(activity.created_date).fromNow()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}