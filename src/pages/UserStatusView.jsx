import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

export default function UserStatusView() {
  const urlParams = new URLSearchParams(window.location.search);
  const userEmail = urlParams.get('userEmail');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: targetUser } = useQuery({
    queryKey: ['target-user', userEmail],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: userEmail });
      return users[0];
    },
    enabled: !!userEmail
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['user-statuses', userEmail],
    queryFn: async () => {
      const now = new Date().toISOString();
      const allStatuses = await base44.entities.UserStatus.filter({ user_email: userEmail }, '-created_date');
      return allStatuses.filter(s => new Date(s.expires_at) > new Date(now));
    },
    enabled: !!userEmail
  });

  const viewMutation = useMutation({
    mutationFn: async (statusId) => {
      const existingViews = await base44.entities.UserStatusView.filter({
        status_id: statusId,
        viewer_email: user.email
      });

      if (existingViews.length === 0) {
        await base44.entities.UserStatusView.create({
          status_id: statusId,
          viewer_email: user.email
        });

        const status = statuses.find(s => s.id === statusId);
        await base44.entities.UserStatus.update(statusId, {
          views_count: (status.views_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-statuses'] });
    }
  });

  const currentStatus = statuses[currentIndex];

  useEffect(() => {
    if (!currentStatus || !user) return;

    viewMutation.mutate(currentStatus.id);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < statuses.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          }
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentIndex, currentStatus]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    }
  };

  if (!currentStatus || !targetUser) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <p className="text-gray-400">Keine Status-Updates verfügbar</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Progress bars */}
      <div className="fixed top-0 left-0 right-0 z-50 flex gap-1 p-2">
        {statuses.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="fixed top-4 left-0 right-0 z-40 px-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={targetUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.email}`}
              alt={targetUser.full_name}
              className="w-10 h-10 rounded-full ring-2 ring-white/30"
            />
            <div>
              <p className="font-semibold text-white text-sm">{targetUser.display_name || targetUser.full_name}</p>
              <p className="text-xs text-white/70">vor {Math.round((Date.now() - new Date(currentStatus.created_date).getTime()) / 3600000)}h</p>
            </div>
          </div>
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-screen flex items-center justify-center"
          style={{
            background: currentStatus.type === 'text' ? currentStatus.background_color : '#000'
          }}
        >
          {currentStatus.type === 'text' ? (
            <div className="px-8">
              <p className="text-white text-3xl font-bold text-center break-words">
                {currentStatus.content}
              </p>
            </div>
          ) : currentStatus.type === 'image' ? (
            <div className="relative w-full h-full">
              <img
                src={currentStatus.content}
                alt="Status"
                className="w-full h-full object-contain"
              />
              {currentStatus.caption && (
                <div className="absolute bottom-20 left-0 right-0 px-6">
                  <p className="text-white text-lg font-medium text-center bg-black/50 rounded-xl p-4">
                    {currentStatus.caption}
                  </p>
                </div>
              )}
            </div>
          ) : currentStatus.type === 'video' ? (
            <div className="w-full h-full">
              <video
                src={currentStatus.content}
                className="w-full h-full object-contain"
                controls
                autoPlay
                loop
              />
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="fixed inset-0 z-30 flex">
        <button
          onClick={handlePrevious}
          className="flex-1"
          disabled={currentIndex === 0}
        />
        <button
          onClick={handleNext}
          className="flex-1"
          disabled={currentIndex === statuses.length - 1}
        />
      </div>

      {/* Views */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <div className="flex items-center justify-center gap-2 bg-black/50 rounded-full px-4 py-2 w-fit mx-auto">
          <Eye className="w-4 h-4 text-white" />
          <span className="text-white text-sm">{currentStatus.views_count || 0} Aufrufe</span>
        </div>
      </div>
    </div>
  );
}