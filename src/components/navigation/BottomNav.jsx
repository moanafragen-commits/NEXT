import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Search, Plus, Heart, User, Image, UserPlus, X, MessageCircle, Users, BookOpen, Share2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function BottomNav({ user }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const isActive = (pageName) => {
    return currentPath.includes(pageName);
  };

  const navItems = [
    { icon: Home, page: 'Feed', label: 'Home' },
    { icon: Search, page: 'Characters', label: 'Suche' },
    { icon: MessageCircle, page: 'Home', label: 'Chats' },
    { icon: Users, page: 'GroupChats', label: 'Gruppen' },
    { icon: Plus, page: null, label: 'Erstellen', isCreate: true },
    { icon: Share2, page: 'RelationshipMap', label: 'Karte' },
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

      <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 auto-theme-nav">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          {navItems.map((item, i) => {
            if (item.isProfile) {
              return (
                <Link key={i} to={createPageUrl('UserProfile')} className="flex items-center justify-center w-14 h-14">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Profil"
                      className={`w-7 h-7 rounded-full object-cover ${isActive('UserProfile') ? 'ring-2 ring-black' : 'ring-1 ring-gray-300'}`}
                    />
                  ) : (
                    <div className={`w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center ${isActive('UserProfile') ? 'ring-2 ring-black' : ''}`}>
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </Link>
              );
            }

            if (item.isCreate) {
              return (
                <button key={i} onClick={() => setShowCreateMenu(!showCreateMenu)} className="flex items-center justify-center w-14 h-14">
                  <div className={`w-7 h-7 border-2 border-black rounded-lg flex items-center justify-center transition-transform ${showCreateMenu ? 'rotate-45' : ''}`}>
                    <Plus className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </div>
                </button>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.page);

            return (
              <Link key={i} to={createPageUrl(item.page)} className="flex items-center justify-center w-14 h-14">
                <Icon className={`w-7 h-7 ${active ? 'text-black fill-black' : 'text-black'}`} strokeWidth={active ? 2.5 : 1.5} />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}