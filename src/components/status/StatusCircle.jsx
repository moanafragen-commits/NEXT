import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StatusCircle({ character, hasNewStatus, onClick }) {
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;

  return (
    <Link
      to={createPageUrl(`CharacterStatus?characterId=${character.id}`)}
      className="flex flex-col items-center gap-1 min-w-[70px]">

      <div className="relative">
        








      </div>
      
    </Link>);

}