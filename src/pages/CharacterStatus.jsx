import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Eye, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import StatusReactionBar from '@/components/status/StatusReactionBar';
import StatusInsightsSheet from '@/components/status/StatusInsightsSheet';

export default function CharacterStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  const queryClient = useQueryClient();

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses', characterId],
    queryFn: async () => {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const allStatuses = await base44.entities.CharacterStatus.filter(
        { character_id: characterId },
        '-created_date'
      );
      return allStatuses.filter(s => new Date(s.created_date) > twentyFourHoursAgo);
    },
    enabled: !!characterId
  });

  const markViewMutation = useMutation({
    mutationFn: async (statusId) => {
      const existing = await base44.entities.StatusView.filter({
        status_id: statusId,
        user_email: user.email
      });
      if (existing.length === 0) {
        await base44.entities.StatusView.create({
          status_id: statusId,
          user_email: user.email
        });
        await base44.entities.CharacterStatus.update(statusId, {
          views_count: (currentStatus?.views_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses', characterId] });
    }
  });

  const currentStatus = statuses[currentIndex];

  useEffect(() => {
    if (!currentStatus) return;
    markViewMutation.mutate(currentStatus.id);
    
    setProgress(0);
    const duration = 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          if (currentIndex < statuses.length - 1) {
            setCurrentIndex(currentIndex + 1);
          }
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, currentStatus]);

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!character || statuses.length === 0) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Keine Status-Posts verfügbar</p>
          <Link to={createPageUrl('Home')}>
            <Button>Zurück</Button>
          </Link>
        </div>
      </div>
    );
  }

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative w-full max-w-md h-screen bg-[#111]">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {statuses.map((_, idx) => (
            <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: '0%' }}
                animate={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-20 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={character.avatar_url || defaultAvatar}
              alt={character.name}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-white font-semibold">{character.name}</p>
              <p className="text-xs text-gray-300">
                {formatDistanceToNow(new Date(currentStatus.created_date), { addSuffix: true, locale: de })}
              </p>
            </div>
          </div>
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-white">
              <X className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Status Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStatus.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex items-center justify-center"
          >
            <img
              src={currentStatus.image_url}
              alt="Status"
              className="max-h-screen w-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {/* Caption */}
        {currentStatus.caption && (
          <div className="absolute bottom-36 left-0 right-0 px-6">
            <p className="text-white text-center text-sm" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              {currentStatus.caption}
            </p>
          </div>
        )}

        {/* Reaction Bar & Views */}
        <div className="absolute bottom-4 left-0 right-0 px-4 z-20 space-y-2">
          <StatusReactionBar
            statusId={currentStatus.id}
            characterId={characterId}
            characterName={character.name}
            statusCaption={currentStatus.caption}
            statusImageUrl={currentStatus.image_url}
          />
          <button
            onClick={() => setShowInsights(true)}
            className="flex items-center justify-center gap-2 text-white/70 hover:text-white w-full transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-xs">{currentStatus.views_count || 0} Aufrufe</span>
            <BarChart3 className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Insights Sheet */}
        <AnimatePresence>
          {showInsights && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowInsights(false)}
                className="fixed inset-0 bg-black/50 z-40"
              />
              <StatusInsightsSheet
                statusId={currentStatus.id}
                viewsCount={currentStatus.views_count}
                onClose={() => setShowInsights(false)}
              />
            </>
          )}
        </AnimatePresence>

        {/* Navigation areas */}
        <div className="absolute inset-0 flex">
          <div className="flex-1" onClick={handlePrev} />
          <div className="flex-1" onClick={handleNext} />
        </div>

        {/* Navigation arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 backdrop-blur-sm rounded-full p-2"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {currentIndex < statuses.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 backdrop-blur-sm rounded-full p-2"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}