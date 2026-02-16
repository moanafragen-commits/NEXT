import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Inbox, Star, Archive, Contact } from 'lucide-react';
import { getTagColor } from '@/components/chat/TagManager';

const TABS = [
  { key: 'all', icon: Inbox, label: 'Alle' },
  { key: 'favorites', icon: Star, label: 'Favoriten' },
  { key: 'archived', icon: Archive, label: 'Archiviert' }
];

export default function FilterTabs({ viewFilter, onFilterChange, activeTag, onTagChange, allTags }) {
  return (
    <div>
      <div className="px-4 pb-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
        <Link to={createPageUrl('Characters')}>
          <button className="px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 press-effect transition-all">
            <Contact className="w-3.5 h-3.5 inline mr-1" />
            Charaktere
          </button>
        </Link>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border press-effect transition-all ${
              viewFilter === tab.key
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-white/5'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 inline mr-1" />
            {tab.label}
          </button>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="px-4 pb-2.5 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagChange(activeTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap border transition-all ${
                activeTag === tag ? getTagColor(tag) : 'bg-white/[0.03] text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}