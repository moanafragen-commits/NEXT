import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StatusCircle({ character, hasNewStatus, onClick }) {
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;

  return (
    <Link
      to={createPageUrl(`CharacterStatus?characterId=${character.id}`)}
      className="flex flex-col items-center gap-1 min-w-[70px]"
    >
      <div className="relative">
        <div className={`w-16 h-16 rounded-full p-0.5 ${hasNewStatus ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500' : 'bg-gray-600'}`}>
          <div className="w-full h-full rounded-full bg-[#111] p-0.5">
            <img
              src={character.avatar_url || defaultAvatar}
              alt={character.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
      </div>
      <span className="text-xs text-gray-300 truncate max-w-[70px]">{character.name}</span>
    </Link>
  );
}