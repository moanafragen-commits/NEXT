import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HeartCrack } from 'lucide-react';
import { SEVERITY_CONFIG } from './ConflictSystem';

export default function ConflictBanner({ characterId, userEmail }) {
  const { data: conflicts = [] } = useQuery({
    queryKey: ['active-conflict', characterId],
    queryFn: () => base44.entities.ConflictEvent.filter({ 
      character_id: characterId, 
      user_email: userEmail, 
      status: 'active' 
    }),
    enabled: !!characterId && !!userEmail
  });

  const activeConflict = conflicts[0];
  if (!activeConflict) return null;

  const config = SEVERITY_CONFIG[activeConflict.severity] || SEVERITY_CONFIG.mittel;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`mx-4 mt-2 p-3 rounded-xl ${config.bg} border ${config.border}`}
      >
        <div className="flex items-start gap-2">
          <HeartCrack className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${config.color}`}>
              {activeConflict.emoji} {config.label}
            </p>
            <p className="text-xs text-gray-400 mt-1">{activeConflict.character_feeling}</p>
            <p className="text-[10px] text-gray-500 mt-1.5 italic">
              💡 {activeConflict.resolution_hint}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}