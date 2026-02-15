import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Search, MessageCircle, Settings, MoreVertical, Send, X, Loader2, Users, User, Bell, BellOff, Star, Archive, Inbox, Grid } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CharacterCard from '@/components/chat/CharacterCard';
import CreateCharacterModal from '@/components/chat/CreateCharacterModal';
import StatusCircle from '@/components/status/StatusCircle';
import UserStatusCircle from '@/components/status/UserStatusCircle';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/components/notifications/NotificationManager';
import UnreadBadge from '@/components/notifications/UnreadBadge';

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [viewFilter, setViewFilter] = useState('all'); // all, favorites, archived
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { permission, requestPermission } = useNotifications(user);

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

  const { data: unreadGroupMessages = 0 } = useQuery({
    queryKey: ['unread-group-messages'],
    queryFn: async () => {
      const memberships = await base44.entities.GroupChatMember.filter({ member_type: 'user', member_id: user.email });
      const groupIds = memberships.map(m => m.group_id);
      
      let totalUnread = 0;
      for (const groupId of groupIds) {
        const messages = await base44.entities.GroupChatMessage.filter({ group_id: groupId }, '-created_date', 50);
        const reads = await base44.entities.MessageRead.filter({ user_email: user.email, message_type: 'group' });
        const readIds = new Set(reads.map(r => r.message_id));
        totalUnread += messages.filter(m => m.sender_id !== user.email && !readIds.has(m.id)).length;
      }
      return totalUnread;
    },
    enabled: !!user,
    refetchInterval: 30000
  });
  
  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });
  
  const { data: messages = [] } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 100)
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const now = new Date();
      const allStatuses = await base44.entities.CharacterStatus.filter({}, '-created_date', 100);
      return allStatuses.filter(s => new Date(s.expires_at) > now);
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
      const allStatuses = await base44.entities.UserStatus.list('-created_date', 100);
      return allStatuses.filter(s => new Date(s.expires_at) > now);
    }
  });

  const { data: userStatusViews = [] } = useQuery({
    queryKey: ['user-status-views', user?.email],
    queryFn: () => base44.entities.UserStatusView.filter({ viewer_email: user.email }),
    enabled: !!user
  });
  
  const getLastMessage = (characterId) => {
    return messages.find(m => m.character_id === characterId);
  };

  const deleteCharacterMutation = useMutation({
    mutationFn: async (characterId) => {
      await base44.entities.Character.delete(characterId);
      const messages = await base44.entities.ChatMessage.filter({ character_id: characterId });
      await Promise.all(messages.map(m => base44.entities.ChatMessage.delete(m.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    }
  });
  
  const filteredCharacters = characters.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (viewFilter === 'favorites') return matchesSearch && c.is_favorite;
    if (viewFilter === 'archived') return matchesSearch && c.is_archived;
    return matchesSearch && !c.is_archived;
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['messages', selectedCharacter?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ character_id: selectedCharacter?.id }, 'created_date', 50),
    enabled: !!selectedCharacter
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const charId = selectedCharacter.id;
      
      await base44.entities.ChatMessage.create({
        character_id: charId,
        role: 'user',
        content
      });
      
      await queryClient.invalidateQueries({ queryKey: ['messages', charId] });
      setIsTyping(true);
      
      const history = chatMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const bioContext = selectedCharacter.biography ? `\n\nHintergrundgeschichte:\n${selectedCharacter.biography}` : '';
      const styleContext = selectedCharacter.writing_style ? `Schreibstil: ${selectedCharacter.writing_style}.` : '';
      const lengthContext = selectedCharacter.response_length === 'kurz' ? 'Halte dich kurz (1-2 Sätze).' : 
                           selectedCharacter.response_length === 'ausführlich' ? 'Antworte ausführlich und detailliert.' : '';
      const customContext = selectedCharacter.custom_instructions ? `\n\nZusätzliche Anweisungen: ${selectedCharacter.custom_instructions}` : '';
      
      const now = new Date();
      const dateTimeContext = `\n\nAktuelles Datum: ${now.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\nAktuelle Uhrzeit: ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${selectedCharacter.name}. ${selectedCharacter.personality}${bioContext}${dateTimeContext}

${styleContext} ${lengthContext}${customContext}

Bisheriger Chatverlauf:
${history.map(h => `${h.role === 'user' ? 'Nutzer' : selectedCharacter.name}: ${h.content}`).join('\n')}

Nutzer: ${content}

Antworte als ${selectedCharacter.name}. Bleibe in deiner Rolle.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }
          }
        }
      });
      
      await base44.entities.ChatMessage.create({
        character_id: charId,
        role: 'assistant',
        content: response.response
      });
      
      return { charId };
    },
    onSuccess: ({ charId }) => {
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ['messages', charId] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    },
    onError: () => {
      setIsTyping(false);
    }
  });

  const handleSendMessage = () => {
    if (!chatMessage.trim() || isTyping || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(chatMessage);
    setChatMessage('');
  };
  
  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            NEXT
          </h1>
          <div className="flex items-center gap-1">
            <Link to={createPageUrl('UserChats')}>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-white/10 relative h-9 w-9"
              >
                <User className="w-5 h-5" />
                <UnreadBadge count={unreadUserMessages} />
              </Button>
            </Link>
            <Link to={createPageUrl('GroupChats')}>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-white/10 relative h-9 w-9"
              >
                <Users className="w-5 h-5" />
                <UnreadBadge count={unreadGroupMessages} />
              </Button>
            </Link>
            <Link to={createPageUrl('Feed')}>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-white/10 h-9 w-9"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-white/10 h-9 w-9"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#262626] border-white/10">
                <DropdownMenuItem asChild className="text-gray-200 hover:bg-white/5 cursor-pointer">
                  <Link to={createPageUrl('CharacterLibrary')} className="flex items-center">
                    <Grid className="w-4 h-4 mr-2" />
                    Bibliothek
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-200 hover:bg-white/5 cursor-pointer">
                  <Link to={createPageUrl('NotificationSettings')} className="flex items-center">
                    {permission === 'granted' ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
                    Benachrichtigungen
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-200 hover:bg-white/5 cursor-pointer">
                  <Link to={createPageUrl('UserProfile')} className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Profil & Einstellungen
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen..."
              className="w-full bg-[#262626] border-0 text-white pl-11 rounded-xl placeholder-gray-500 focus-visible:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setViewFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              viewFilter === 'all' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#262626] text-gray-400 hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4 inline mr-2" />
            Alle
          </button>
          <button
            onClick={() => setViewFilter('favorites')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              viewFilter === 'favorites' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#262626] text-gray-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Favoriten
          </button>
          <button
            onClick={() => setViewFilter('archived')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              viewFilter === 'archived' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#262626] text-gray-400 hover:text-white'
            }`}
          >
            <Archive className="w-4 h-4 inline mr-2" />
            Archiviert
          </button>
        </div>
        </header>

        {/* Status Bar */}
        <div className="px-4 py-3 overflow-x-auto border-b border-white/5 scrollbar-hide">
          <div className="flex gap-3">
            {/* Own Status */}
            {user && (
              <UserStatusCircle user={user} isOwn={true} />
            )}

            {/* Other Users' Status */}
            {allUsers.filter(u => u.email !== user?.email).map(otherUser => {
              const userStatusList = userStatuses.filter(s => s.user_email === otherUser.email);
              if (userStatusList.length === 0) return null;
              
              const viewedStatusIds = new Set(userStatusViews.map(v => v.status_id));
              const hasUnseenStatus = userStatusList.some(s => !viewedStatusIds.has(s.id));
              
              return (
                <UserStatusCircle
                  key={otherUser.email}
                  user={otherUser}
                  hasNewStatus={hasUnseenStatus}
                />
              );
            })}

            {/* Character Status */}
            {characters.filter(c => !c.is_archived).slice(0, 8).map(character => {
              const characterStatuses = statuses.filter(s => s.character_id === character.id);
              const viewedStatusIds = new Set(statusViews.map(v => v.status_id));
              const hasUnseenStatus = characterStatuses.some(s => !viewedStatusIds.has(s.id));
              
              return (
                <StatusCircle
                  key={character.id}
                  character={character}
                  hasNewStatus={hasUnseenStatus}
                />
              );
            })}
          </div>
        </div>

        {/* Character List */}
        <main className="pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Keine Charaktere</h2>
            <p className="text-gray-400 mb-6">Erstelle deinen ersten KI-Charakter und beginne zu chatten!</p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Charakter erstellen
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredCharacters.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CharacterCard 
                  character={character}
                  lastMessage={getLastMessage(character.id)}
                  onClick={() => setSelectedCharacter(character)}
                  onDelete={(id) => {
                    if (confirm('Charakter und alle Nachrichten löschen?')) {
                      deleteCharacterMutation.mutate(id);
                    }
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </main>
      
      {/* FAB */}
      <motion.button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-7 h-7" />
      </motion.button>
      
      <CreateCharacterModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['characters'] })}
      />

      {/* Chat Sidebar */}
      <AnimatePresence>
        {selectedCharacter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCharacter(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#1a1a1a] border-l border-white/10 z-50 flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCharacter(null)}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
                <img
                  src={selectedCharacter.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${selectedCharacter.name}`}
                  alt={selectedCharacter.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedCharacter.name}</h3>
                  <p className="text-xs text-gray-500">
                    {isTyping ? <span className="text-emerald-400">schreibt...</span> : 'online'}
                  </p>
                </div>
                <Link to={createPageUrl(`Chat?characterId=${selectedCharacter.id}`)}>
                  <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                    Vollbild
                  </Button>
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && selectedCharacter.greeting && (
                  <div className="flex gap-2">
                    <img
                      src={selectedCharacter.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${selectedCharacter.name}`}
                      alt={selectedCharacter.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="bg-[#262626] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[75%]">
                      <p className="text-sm text-gray-100">{selectedCharacter.greeting}</p>
                    </div>
                  </div>
                )}

                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <img
                        src={selectedCharacter.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${selectedCharacter.name}`}
                        alt={selectedCharacter.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className={`rounded-2xl px-4 py-2.5 max-w-[75%] ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-md'
                        : 'bg-[#262626] text-gray-100 rounded-bl-md'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2 items-center">
                    <img
                      src={selectedCharacter.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${selectedCharacter.name}`}
                      alt={selectedCharacter.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="bg-[#262626] rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/5">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Nachricht schreiben..."
                      className="w-full bg-[#262626] text-white rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-500"
                      disabled={isTyping}
                    />
                  </div>
                  {chatMessage.trim() && (
                    <Button
                      onClick={handleSendMessage}
                      disabled={isTyping || sendMessageMutation.isPending}
                      size="icon"
                      className="h-11 w-11 rounded-full bg-emerald-600 hover:bg-emerald-500 flex-shrink-0"
                    >
                      {isTyping || sendMessageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}