import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function StatusViewersList({ statusId, viewsCount, onClose }) {
  const { data: views = [], isLoading } = useQuery({
    queryKey: ['status-viewers', statusId],
    queryFn: async () => {
      const allViews = await base44.entities.UserStatusView.filter({ status_id: statusId });
      // Fetch user details for each viewer
      const viewers = [];
      for (const view of allViews) {
        const users = await base44.entities.User.filter({ email: view.viewer_email });
        if (users[0]) {
          viewers.push({ ...view, user: users[0] });
        }
      }
      return viewers;
    },
    enabled: !!statusId
  });

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-[#1a1a1a] rounded-t-2xl max-h-[60vh] flex flex-col"
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-white">{viewsCount || 0} Aufrufe</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <p className="text-center text-gray-500 py-6">Laden...</p>
        ) : views.length === 0 ? (
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
                  {view.user.display_name || view.user.full_name}
                </p>
                <p className="text-xs text-gray-500">{view.user.email}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}