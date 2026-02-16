import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Search, Plus, Heart, User, Image, UserPlus, X, MessageCircle, Users, BookOpen, Share2, Trophy, Bell, Store } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function BottomNav({ user }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ['unread-notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: user?.email, is_read: false }),
    enabled: !!user?.email,
    refetchInterval: 15000
  });

  const unreadCount = unreadNotifications.length;

  const isActive = (pageName) => {
    return currentPath.includes(pageName);
  };

  const navItems = [
    { icon: Home, page: 'Feed', label: 'Home' },
    { icon: Search, page: 'Characters', label: 'Suche' },
    { icon: MessageCircle, page: 'Home', label: 'Chats' },
    { icon: Bell, page: 'Notifications', label: 'Aktivität', isBell: true },
    { icon: Plus, page: null, label: 'Erstellen', isCreate: true },
    { icon: Store, page: 'Shop', label: 'Shop' },
    { icon: null, page: 'UserProfile', label: 'Profil', isProfile: true },
  ];

  return (
    <>
      {/* Create Menu Overlay */}
      <AnimatePresence>
        {showCreateMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowCreateMenu(false)}
            />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-56 auto-theme-card"
              >
              <Link
                to={createPageUrl('CreatePost')}
                onClick={() => setShowCreateMenu(false)}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <Image className="w-5 h-5 text-black" />
                <span className="text-sm font-medium">Neuer Beitrag</span>
              </Link>
              <div className="h-px bg-gray-100" />
              <Link
                to={createPageUrl('Characters') + '?create=true'}
                onClick={() => setShowCreateMenu(false)}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <UserPlus className="w-5 h-5 text-black" />
                <span className="text-sm font-medium">Neuer Charakter</span>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/[0.06] auto-theme-nav">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-1">
          {navItems.map((item, i) => {
            if (item.isProfile) {
              return (
                <Link key={i} to={createPageUrl('UserProfile')} className="flex items-center justify-center w-10 h-14">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Profil"
                      className={`w-6 h-6 rounded-full object-cover ${isActive('UserProfile') ? 'ring-2 ring-black' : 'ring-1 ring-gray-300'}`}
                    />
                  ) : (
                    <div className={`w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center ${isActive('UserProfile') ? 'ring-2 ring-black' : ''}`}>
                      <User className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  )}
                </Link>
              );
            }

            if (item.isCreate) {
              return (
                <button key={i} onClick={() => setShowCreateMenu(!showCreateMenu)} className="flex items-center justify-center w-10 h-14">
                  <div className={`w-6 h-6 border-2 border-black rounded-lg flex items-center justify-center transition-transform ${showCreateMenu ? 'rotate-45' : ''}`}>
                    <Plus className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
                  </div>
                </button>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.page);

            if (item.isBell) {
              return (
                <Link key={i} to={createPageUrl(item.page)} className="flex items-center justify-center w-10 h-14 relative">
                  <Icon className={`w-6 h-6 ${active ? 'text-black fill-black' : 'text-black'}`} strokeWidth={active ? 2.5 : 1.5} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-0 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <Link key={i} to={createPageUrl(item.page)} className="flex items-center justify-center w-10 h-14">
                <Icon className={`w-6 h-6 ${active ? 'text-black fill-black' : 'text-black'}`} strokeWidth={active ? 2.5 : 1.5} />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}