import React from 'react';
import StatusCircle from '@/components/status/StatusCircle';
import UserStatusCircle from '@/components/status/UserStatusCircle';

export default function StatusBar({ user, allUsers, characters, statuses, statusViews, userStatuses, userStatusViews }) {
  if (!user) return null;

  const viewedStatusIds = new Set((statusViews || []).map(v => v.status_id));
  const viewedUserStatusIds = new Set((userStatusViews || []).map(v => v.status_id));

  const otherUsersWithStatus = (allUsers || []).filter(u => {
    if (u.email === user.email) return false;
    return (userStatuses || []).some(s => s.user_email === u.email);
  });

  const charsWithStatus = (characters || []).filter(c =>
    !c.is_archived && (statuses || []).some(s => s.character_id === c.id)
  );

  if (otherUsersWithStatus.length === 0 && charsWithStatus.length === 0) {
    return (
      <div className="px-4 py-3 border-b border-white/[0.03]">
        <div className="flex gap-3">
          <UserStatusCircle user={user} isOwn={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 overflow-x-auto border-b border-white/[0.03] scrollbar-hide">
      <div className="flex gap-3">
        <UserStatusCircle user={user} isOwn={true} />

        {otherUsersWithStatus.map(otherUser => {
          const userStatusList = (userStatuses || []).filter(s => s.user_email === otherUser.email);
          const hasUnseen = userStatusList.some(s => !viewedUserStatusIds.has(s.id));
          return (
            <UserStatusCircle key={otherUser.email} user={otherUser} hasNewStatus={hasUnseen} />
          );
        })}

        {charsWithStatus.map(character => {
          const charStatuses = (statuses || []).filter(s => s.character_id === character.id);
          const hasUnseen = charStatuses.some(s => !viewedStatusIds.has(s.id));
          return (
            <StatusCircle key={character.id} character={character} hasNewStatus={hasUnseen} />
          );
        })}
      </div>
    </div>
  );
}