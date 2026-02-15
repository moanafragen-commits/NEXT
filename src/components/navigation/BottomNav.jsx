import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Search, Plus, Heart, User } from 'lucide-react';

export default function BottomNav({ user }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (pageName) => {
    return currentPath.includes(pageName);
  };

  const navItems = [
    { icon: Home, page: 'Feed', label: 'Home' },
    { icon: Search, page: 'Characters', label: 'Suche' },
    { icon: Plus, page: null, label: 'Erstellen', isCreate: true },
    { icon: Heart, page: 'Activity', label: 'Aktivität' },
    { icon: null, page: 'UserProfile', label: 'Profil', isProfile: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
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
              <Link key={i} to={createPageUrl('CreatePost')} className="flex items-center justify-center w-14 h-14">
                <div className="w-7 h-7 border-2 border-black rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-black" strokeWidth={2.5} />
                </div>
              </Link>
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
  );
}