import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, MessageCircle, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CharacterCard from '@/components/chat/CharacterCard';
import CreateCharacterModal from '@/components/chat/CreateCharacterModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/components/notifications/NotificationManager';
import BottomNav from '@/components/navigation/BottomNav';
import TopBar from '@/components/gamification/TopBar';
import EventBanner from '@/components/events/EventBanner';
import DynamicEventFeed from '@/components/events/DynamicEventFeed';
import CharacterWidget from '@/components/widgets/CharacterWidget';
import SeasonalBanner from '@/components/seasonal/SeasonalBanner';
import HomeHeader from '@/components/home/HomeHeader';
import FilterTabs from '@/components/home/FilterTabs';
import StatusBar from '@/components/home/StatusBar';
import ChatSidebar from '@/components/home/ChatSidebar';

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [viewFilter, setViewFilter] = useState('all');
  const [activeTag, setActiveTag] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { permission } = useNotifications(user);

  const { data: unreadUserMessages = 0 } = useQuery({
    queryKey: ['unread-user-messages'],
    queryFn: async () => {
      const messages = await base44.entities.UserMessage.filter({ recipient_email: user.email }, '-created_date', 100);
      const reads = await base44.entities.MessageRead.filter({ user_email: user.email, message_type: 'user' });
      const readIds = new Set(reads.map(r => r.message_id));
      return messages.filter(m => !readIds.has(m.id)).length;
    },
    enabled: !!user
  });
  
  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });
  
  const { data: messages = [] } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 500)
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const now = new Date();
      const all = await base44.entities.CharacterStatus.filter({}, '-created_date', 100);
      return all.filter(s => new Date(s.expires_at) > now);
    }
  });

  const { data: statusViews = [] } = useQuery({
    queryKey: ['status-views', user?.email],
    queryFn: () => base44.entities.StatusView.filter({ user_email: user.email }),
    enabled: !!user
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: userStatuses = [] } = useQuery({
    queryKey: ['user-statuses'],
    queryFn: async () => {
      const now = new Date();
      const all = await base44.entities.UserStatus.list('-created_date', 100);
      return all.filter(s => new Date(s.expires_at) > now);
    }
  });

  const { data: userStatusViews = [] } = useQuery({
    queryKey: ['user-status-views', user?.email],
    queryFn: () => base44.entities.UserStatusView.filter({ viewer_email: user.email }),
    enabled: !!user
  });
  
  const getLastMessage = (characterId) => messages.find(m => m.character_id === characterId);

  const getUnreadCount = (characterId) => {
    return messages.filter(m => m.character_id === characterId && m.role === 'assistant' && m.status !== 'read').length;
  };

  const deleteChatMutation = useMutation({
    mutationFn: async (characterId) => {
      const msgs = await base44.entities.ChatMessage.filter({ character_id: characterId });
      await Promise.all(msgs.map(m => base44.entities.ChatMessage.delete(m.id)));
      if (user) {
        const memories = await base44.entities.CharacterMemory.filter({ character_id: characterId, user_email: user.email });
        await Promise.all(memories.map(m => base44.entities.CharacterMemory.delete(m.id)));
      }
      const charStatuses = await base44.entities.CharacterStatus.filter({ character_id: characterId });
      await Promise.all(charStatuses.map(s => base44.entities.CharacterStatus.delete(s.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    }
  });
  
  const allTags = [...new Set(characters.flatMap(c => c.tags || []))];

  const filteredCharacters = characters.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !activeTag || (c.tags || []).includes(activeTag);
    if (viewFilter === 'favorites') return matchesSearch && matchesTag && c.is_favorite && !c.is_blocked;
    if (viewFilter === 'archived') return matchesSearch && matchesTag && c.is_archived && !c.is_blocked;
    return matchesSearch && matchesTag && !c.is_archived && !c.is_blocked;
  });

  // Sort by last message time
  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    const msgA = getLastMessage(a.id);
    const msgB = getLastMessage(b.id);
    if (!msgA && !msgB) return 0;
    if (!msgA) return 1;
    if (!msgB) return -1;
    return new Date(msgB.created_date) - new Date(msgA.created_date);
  });
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-teal-500/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/5">
        <HomeHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          unreadUserMessages={unreadUserMessages}
          permission={permission}
        />
        <FilterTabs
          viewFilter={viewFilter}
          onFilterChange={setViewFilter}
          activeTag={activeTag}
          onTagChange={setActiveTag}
          allTags={allTags}
        />
      </header>

      {/* Gamification TopBar */}
      {user && <TopBar userEmail={user.email} />}

      {/* Seasonal Banner */}
      <SeasonalBanner />

      {/* Event Banner */}
      {user && <EventBanner userEmail={user.email} />}

      {/* Dynamic Events */}
      {user && <DynamicEventFeed userEmail={user.email} />}

      {/* Character Widgets */}
      {user && characters.filter(c => c.is_favorite && !c.is_archived).length > 0 && (
        <div className="px-4 py-2">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {characters.filter(c => c.is_favorite && !c.is_archived).map(c => (
              <CharacterWidget key={c.id} characterId={c.id} />
            ))}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <StatusBar
        user={user}
        allUsers={allUsers}
        characters={characters}
        statuses={statuses}
        statusViews={statusViews}
        userStatuses={userStatuses}
        userStatusViews={userStatusViews}
      />

      {/* Character List */}
      <main className="pb-20 relative z-[1]">
        <div className="px-4 py-2 flex justify-end">
            <Link to={createPageUrl('Tours')}>
                <Button variant="outline" size="sm" className="bg-[#1a1a1a]/80 backdrop-blur border-white/10 text-white hover:bg-white/10 gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    Touren & Karte
                </Button>
            </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : sortedCharacters.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold mb-2 text-white">Keine Chats</h2>
            <p className="text-gray-500 mb-5 text-sm max-w-xs">Erstelle deinen ersten KI-Charakter und beginne zu chatten!</p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 press-effect rounded-xl px-6 h-10"
            >
              <Plus className="w-5 h-5 mr-2" />
              Charakter erstellen
            </Button>
          </motion.div>
        ) : (
          <div>
            {sortedCharacters.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
              >
                <CharacterCard 
                  character={character}
                  lastMessage={getLastMessage(character.id)}
                  unreadCount={getUnreadCount(character.id)}
                  onClick={() => setSelectedCharacter(character)}
                  onDeleteChat={(id) => {
                    if (confirm('Chatverlauf löschen?')) deleteChatMutation.mutate(id);
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
      
      <CreateCharacterModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['characters'] })}
      />

      <BottomNav user={user} />

      {/* Chat Sidebar */}
      <AnimatePresence>
        {selectedCharacter && (
          <ChatSidebar
            character={selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
            userEmail={user?.email}
          />
        )}
      </AnimatePresence>
    </div>
  );
}