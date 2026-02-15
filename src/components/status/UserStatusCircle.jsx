import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function UserStatusCircle({ user, hasNewStatus, isOwn = false }) {
  const { data: ownStatuses = [] } = useQuery({
    queryKey: ['own-statuses', user?.email],
    queryFn: async () => {
      const now = new Date();
      const all = await base44.entities.UserStatus.filter({ user_email: user.email }, '-created_date');
      return all.filter(s => new Date(s.expires_at) > now);
    },
    enabled: isOwn && !!user?.email
  });

  const hasOwnStatus = isOwn && ownStatuses.length > 0;

  if (isOwn) {
    return (
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <Link to={hasOwnStatus ? createPageUrl(`UserStatusView?userEmail=${user.email}`) : createPageUrl('CreateUserStatus')}>
          <div className="relative">
            {hasOwnStatus ? (
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-emerald-400 via-teal-400 to-emerald-600">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt="Dein Status"
                  className="w-full h-full rounded-full object-cover border-2 border-[#111]"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full p-0.5 bg-gray-600 relative">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt="Dein Status"
                  className="w-full h-full rounded-full object-cover border-2 border-[#111]"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#111]">
                  <Plus className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}
            {hasOwnStatus && (
              <Link to={createPageUrl('CreateUserStatus')} className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#111]">
                <Plus className="w-3.5 h-3.5 text-white" />
              </Link>
            )}
          </div>
        </Link>
        <span className="text-xs text-gray-300 max-w-[70px] truncate">Dein Status</span>
      </div>
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