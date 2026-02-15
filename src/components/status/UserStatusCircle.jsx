import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus } from 'lucide-react';

export default function UserStatusCircle({ user, hasNewStatus, isOwn = false }) {
  if (isOwn) {
    return (
      <Link to={createPageUrl('CreateUserStatus')} className="flex flex-col items-center gap-2 flex-shrink-0">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ring-2 ring-emerald-500">
            <Plus className="w-8 h-8 text-white" />
          </div>
        </div>
        <span className="text-xs text-gray-300 max-w-[70px] truncate">Dein Status</span>
      </Link>
    );
  }

  return (
    <Link to={createPageUrl(`UserStatusView?userEmail=${user.email}`)} className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className="relative">
        <div className={`w-16 h-16 rounded-full p-0.5 ${
          hasNewStatus 
            ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500' 
            : 'bg-gray-700'
        }`}>
          <img 
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
            alt={user.full_name}
            className="w-full h-full rounded-full object-cover border-2 border-[#111]"
          />
        </div>
      </div>
      <span className="text-xs text-gray-300 max-w-[70px] truncate">{user.display_name || user.full_name}</span>
    </Link>
  );
}