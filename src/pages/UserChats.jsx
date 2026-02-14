import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Search, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function UserChats() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['user-messages'],
    queryFn: () => base44.entities.UserMessage.list('-created_date', 200),
    enabled: !!user
  });

  const otherUsers = allUsers.filter(u => u.email !== user?.email);

  const getLastMessage = (userEmail) => {
    return messages.find(m => 
      (m.sender_email === user?.email && m.recipient_email === userEmail) ||
      (m.sender_email === userEmail && m.recipient_email === user?.email)
    );
  };

  const filteredUsers = otherUsers.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5">
        <div className="flex items-center gap-3 p-4">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Nutzer-Chats</h1>
        </div>
        
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nutzer suchen..."
              className="w-full bg-[#262626] border-0 text-white pl-11 rounded-xl placeholder-gray-500 focus-visible:ring-emerald-500/50"
            />
          </div>
        </div>
      </header>

      <main>
        {filteredUsers.map((otherUser) => {
          const lastMessage = getLastMessage(otherUser.email);
          
          return (
            <Link key={otherUser.email} to={createPageUrl(`UserChat?userEmail=${otherUser.email}`)}>
              <div className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                    {otherUser.full_name?.[0] || otherUser.email[0].toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#111]" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-white truncate">
                      {otherUser.full_name || otherUser.email}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {format(new Date(lastMessage.created_date), 'HH:mm', { locale: de })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate mt-0.5">
                    {lastMessage ? (
                      <>
                        {lastMessage.sender_email === user?.email && 'Du: '}
                        {lastMessage.content}
                      </>
                    ) : (
                      otherUser.email
                    )}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}