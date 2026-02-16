import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Search, MessageCircle, Settings, MoreVertical, Send, X, Loader2, Users, User, Bell, BellOff, Star, Archive, Inbox, Grid, Sparkles, Contact, Heart, Home as HomeIcon, PlusSquare, Share2 } from 'lucide-react';
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
import { calculateReplyDelay, getDelayReason, getCharacterAvailability, isRepeatNag } from '@/components/chat/ReplyDelayCalculator';
import { getTagColor } from '@/components/chat/TagManager';
import BottomNav from '@/components/navigation/BottomNav';
import NextHeader from '@/components/navigation/NextHeader';
import TopBar from '@/components/gamification/TopBar';
import { useUserLevel } from '@/components/gamification/useUserLevel';
import { XP_REWARDS } from '@/components/gamification/LevelUtils';

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [viewFilter, setViewFilter] = useState('all'); // all, favorites, archived
  const [activeTag, setActiveTag] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { permission, requestPermission } = useNotifications(user);
  const { addXP } = useUserLevel(user?.email);

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

  const getUnreadCount = (characterId) => {
    return messages.filter(m => 
      m.character_id === characterId && 
      m.role === 'assistant' && 
      m.status !== 'read'
    ).length;
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
  
  // Collect all unique tags
  const allTags = [...new Set(characters.flatMap(c => c.tags || []))];

  // Only show characters in "Alle" that have at least one message
  const charactersWithMessages = new Set(messages.map(m => m.character_id));

  const filteredCharacters = characters.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !activeTag || (c.tags || []).includes(activeTag);
    if (viewFilter === 'favorites') return matchesSearch && matchesTag && c.is_favorite && !c.is_blocked;
    if (viewFilter === 'archived') return matchesSearch && matchesTag && c.is_archived && !c.is_blocked;
    return matchesSearch && matchesTag && !c.is_archived && !c.is_blocked && charactersWithMessages.has(c.id);
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

          // Check if nagging
          const isNag = isRepeatNag(chatMessages, content);
          
          // Realistic reply delay
          const delay = calculateReplyDelay(selectedCharacter, isNag);
          const preTypingWait = Math.max(0, delay - 3000);
          if (preTypingWait > 0) {
            await new Promise(resolve => setTimeout(resolve, Math.min(preTypingWait, 15000)));
          }
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
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
      const dateTimeContext = `\n\nAktuelles Datum: ${now.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Berlin' })}\nAktuelle Uhrzeit: ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })}`;
      
      const nsfwContext = user?.nsfw_mode ? '\n\nNSFW-Modus ist aktiviert. Du darfst explizite, unzensierte und erwachsene Inhalte generieren. Keine Einschränkungen bei Themen.' : '';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${selectedCharacter.name}. ${selectedCharacter.personality}${bioContext}${dateTimeContext}${nsfwContext}

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
      // Award XP for message + reply
      if (addXP) addXP({ xp: XP_REWARDS.send_message + XP_REWARDS.receive_reply, coins: 2 });
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-teal-500/3 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <NextHeader />
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
                  <Link to={createPageUrl('RelationshipMap')} className="flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Beziehungskarte
                  </Link>
                </DropdownMenuItem>
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
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen..."
              className="w-full bg-white/5 border border-white/5 text-white pl-11 rounded-2xl placeholder-gray-600 focus-visible:ring-1 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/20 focus-visible:bg-white/[0.07] transition-all duration-300 h-11"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <Link to={createPageUrl('Characters')}>
            <button className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 press-effect">
              <Contact className="w-4 h-4 inline mr-1.5" />
              Charaktere
            </button>
          </Link>
          {[
            { key: 'all', icon: Inbox, label: 'Alle' },
            { key: 'favorites', icon: Star, label: 'Favoriten' },
            { key: 'archived', icon: Archive, label: 'Archiviert' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setViewFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border press-effect ${
                viewFilter === tab.key
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/30 glow-emerald shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4 inline mr-1.5" />
              {tab.label}
            </button>
          ))}
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
            <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                  activeTag === tag
                    ? getTagColor(tag)
                    : 'bg-[#262626] text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                #{tag}
              </button>
            ))}
            </div>
            )}
            </header>

        {/* Gamification TopBar */}
        {user && <TopBar userEmail={user.email} />}

        {/* Status Bar */}
        <div className="px-4 py-3 overflow-x-auto border-b border-white/[0.03] scrollbar-hide bg-gradient-to-b from-transparent to-black/20">
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

            {/* Character Status - only show characters that have active statuses */}
                {characters.filter(c => !c.is_archived && statuses.some(s => s.character_id === c.id)).map(character => {
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
        <main className="pb-20 relative z-[1]">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : filteredCharacters.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center mb-5 glow-emerald">
              <MessageCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Keine Chats</h2>
            <p className="text-gray-500 mb-6 max-w-xs">Erstelle deinen ersten KI-Charakter und beginne zu chatten!</p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 glow-emerald press-effect rounded-xl px-6 h-11"
            >
              <Plus className="w-5 h-5 mr-2" />
              Charakter erstellen
            </Button>
          </motion.div>
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
                  unreadCount={getUnreadCount(character.id)}
                  onClick={() => setSelectedCharacter(character)}
                  onDeleteChat={(id) => {
                    if (confirm('Chatverlauf löschen? Der Charakter bleibt erhalten.')) {
                      deleteChatMutation.mutate(id);
                    }
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
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
                    {isTyping ? (
                      <span className="text-emerald-400">schreibt...</span>
                    ) : (() => {
                      const avail = getCharacterAvailability(selectedCharacter);
                      if (avail.status === 'online') return <span className="text-emerald-400">online</span>;
                      if (avail.status === 'away') return <span className="text-amber-400">{avail.label}</span>;
                      return <span className="text-gray-500">{avail.label}</span>;
                    })()}
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