import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Heart, MessageCircle, Repeat2, Mail, AtSign, UserPlus, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';

const TYPE_CONFIG = {
  like: { icon: Heart, color: 'text-pink-500 bg-pink-500/10', label: 'hat deinen Beitrag geliked' },
  comment: { icon: MessageCircle, color: 'text-blue-400 bg-blue-500/10', label: 'hat deinen Beitrag kommentiert' },
  repost: { icon: Repeat2, color: 'text-emerald-400 bg-emerald-500/10', label: 'hat deinen Beitrag repostet' },
  dm: { icon: Mail, color: 'text-purple-400 bg-purple-500/10', label: 'hat dir eine Nachricht gesendet' },
  mention: { icon: AtSign, color: 'text-amber-400 bg-amber-500/10', label: 'hat dich erwähnt' },
  follow: { icon: UserPlus, color: 'text-cyan-400 bg-cyan-500/10', label: 'folgt dir jetzt' },
};

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

function NotificationItem({ notification }) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.like;
  const Icon = config.icon;

  const linkTo = notification.type === 'dm'
    ? createPageUrl(`UserChat?userEmail=${notification.actor_username?.replace('@', '') || ''}`)
    : notification.post_id
      ? createPageUrl('Feed')
      : null;

  const content = (
    <div className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] ${!notification.is_read ? 'bg-emerald-500/[0.04]' : ''}`}>
      {/* Icon */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Avatar + Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {notification.actor_avatar && (
            <img
              src={notification.actor_avatar}
              alt={notification.actor_name}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
          )}
          <p className="text-sm text-gray-200 leading-snug">
            <span className="font-semibold text-white">{notification.actor_name}</span>{' '}
            {config.label}
          </p>
        </div>

        {/* Preview */}
        {notification.post_preview && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">„{notification.post_preview}"</p>
        )}
        {notification.message_preview && notification.type === 'dm' && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{notification.message_preview}</p>
        )}

        <span className="text-[11px] text-gray-600 mt-1 block">{getTimeAgo(notification.created_date)}</span>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-2" />
      )}
    </div>
  );

  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
}

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter(
      { recipient_email: user.email },
      '-created_date',
      100
    ),
    enabled: !!user
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      for (const n of unread) {
        await base44.entities.Notification.update(n.id, { is_read: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    }
  });

  // Mark all as read when visiting the page
  useEffect(() => {
    if (notifications.some(n => !n.is_read)) {
      markAllReadMutation.mutate();
    }
  }, [notifications.length]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white auto-theme">
      <header className="sticky top-0 z-10 glass border-b border-white/[0.06] auto-theme-header">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Feed')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold">Benachrichtigungen</h1>
            {unreadCount > 0 && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                {unreadCount} neu
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              className="text-emerald-400 hover:text-emerald-300 text-xs"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Alle gelesen
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 text-lg mb-1">Keine Benachrichtigungen</p>
            <p className="text-gray-600 text-sm">Aktivitäten zu deinen Posts erscheinen hier</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <NotificationItem notification={n} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <BottomNav user={user} />
    </div>
  );
}