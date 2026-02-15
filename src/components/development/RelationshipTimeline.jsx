import React from 'react';
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import moment from 'moment';

const EVENT_CONFIG = {
  trust_change: { emoji: '🛡️', color: 'border-blue-500', bg: 'bg-blue-500' },
  jealousy_change: { emoji: '💚', color: 'border-green-500', bg: 'bg-green-500' },
  relationship_type_change: { emoji: '💕', color: 'border-pink-500', bg: 'bg-pink-500' },
  mood_shift: { emoji: '🎭', color: 'border-purple-500', bg: 'bg-purple-500' },
  milestone: { emoji: '🏆', color: 'border-yellow-500', bg: 'bg-yellow-500' },
  conflict: { emoji: '⚡', color: 'border-red-500', bg: 'bg-red-500' },
  bonding: { emoji: '🤗', color: 'border-emerald-500', bg: 'bg-emerald-500' },
  revelation: { emoji: '💡', color: 'border-amber-500', bg: 'bg-amber-500' },
  boundary_crossed: { emoji: '🚧', color: 'border-orange-500', bg: 'bg-orange-500' },
  memory_formed: { emoji: '🧠', color: 'border-cyan-500', bg: 'bg-cyan-500' }
};

export default function RelationshipTimeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Noch keine Beziehungs-Ereignisse.</p>
        <p className="text-xs mt-1">Ereignisse werden automatisch beim Chatten erstellt.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />

      <div className="space-y-4">
        {events.map((event, index) => {
          const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.milestone;
          const impactColor = event.impact_score > 0 ? 'text-emerald-400' : event.impact_score < 0 ? 'text-red-400' : 'text-gray-400';

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-10"
            >
              {/* Timeline dot */}
              <div className={`absolute left-2.5 top-2 w-3 h-3 rounded-full ${config.bg} ring-2 ring-[#111]`} />

              <div className="bg-[#262626] rounded-lg p-3 border border-white/5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{config.emoji}</span>
                      <span className="text-xs font-medium text-white">{event.description}</span>
                    </div>
                    {event.attribute_changed && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] border-white/20 py-0">
                          {event.attribute_changed}
                        </Badge>
                        {event.old_value && event.new_value && (
                          <span className="text-[10px] text-gray-500">
                            {event.old_value} → {event.new_value}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    {event.impact_score !== undefined && event.impact_score !== 0 && (
                      <span className={`text-xs font-bold ${impactColor}`}>
                        {event.impact_score > 0 ? '+' : ''}{event.impact_score}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600 mt-0.5">
                      {moment(event.created_date).fromNow()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}