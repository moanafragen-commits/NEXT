import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, Settings, MoreVertical, User, Bell, BellOff, Users, Grid, Sparkles, Home as HomeIcon, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NextHeader from '@/components/navigation/NextHeader';
import UnreadBadge from '@/components/notifications/UnreadBadge';

export default function HomeHeader({ searchQuery, onSearchChange, unreadUserMessages, permission }) {
  return (
    <div>
      <div className="flex items-center justify-between p-4 pb-2">
        <NextHeader />
        <div className="flex items-center gap-1">
          <Link to={createPageUrl('UserChats')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 relative h-9 w-9">
              <User className="w-5 h-5" />
              <UnreadBadge count={unreadUserMessages} />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 h-9 w-9">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#262626] border-white/10 min-w-[180px]">
              <DropdownMenuItem asChild className="text-gray-200 hover:bg-white/5 cursor-pointer">
                <Link to={createPageUrl('CharacterChat')} className="flex items-center"><Users className="w-4 h-4 mr-2" />C2C Chat</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-200 hover:bg-white/5 cursor-pointer">
                <Link to={createPageUrl('CharacterMap')} className="flex items-center"><HomeIcon className="w-4 h-4 mr-2" />Karte</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-200 hover:bg-white/5 cursor-pointer">
                <Link to={createPageUrl('RelationshipMap')} className="flex items-center"><Share2 className="w-4 h-4 mr-2" />Beziehungskarte</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-200 hover:bg-white/5 cursor-pointer">
                <Link to={createPageUrl('NewsFeed')} className="flex items-center"><Sparkles className="w-4 h-4 mr-2" />Nachrichten</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-200 hover:bg-white/5 cursor-pointer">
                <Link to={createPageUrl('CharacterLibrary')} className="flex items-center"><Grid className="w-4 h-4 mr-2" />Bibliothek</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-200 hover:bg-white/5 cursor-pointer">
                <Link to={createPageUrl('NotificationSettings')} className="flex items-center">
                  {permission === 'granted' ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
                  Benachrichtigungen
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-200 hover:bg-white/5 cursor-pointer">
                <Link to={createPageUrl('UserProfile')} className="flex items-center"><Settings className="w-4 h-4 mr-2" />Einstellungen</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
          <Input
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Suchen..."
            className="w-full bg-white/5 border border-white/5 text-white pl-11 rounded-2xl placeholder-gray-600 focus-visible:ring-1 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/20 h-11"
          />
        </div>
      </div>
    </div>
  );
}