import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Info, Search, X, Pin, Bookmark, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/components/notifications/NotificationManager';
import MoodBadge from '@/components/character/MoodBadge';
import ExportChatButton from '@/components/chat/ExportChatButton';
import ShareChatButton from '@/components/chat/ShareChatButton';
import { calculateReplyDelay, getDelayReason, getCharacterAvailability, isRepeatNag } from '@/components/chat/ReplyDelayCalculator';
import { buildFullPrompt, RESPONSE_SCHEMA } from '@/components/chat/PromptBuilder';
import { generateDiaryEntry, generateDailyActivity } from '@/components/character/DiaryGenerator';
import { checkAndUpdateIllness, getIllnessDisplay } from '@/components/character/IllnessSystem';
import { updateWeatherState, WeatherBadge, buildWeatherContext } from '@/components/character/WeatherSystem';
import { shouldSendSpontaneous, generateSpontaneousMessage } from '@/components/character/SpontaneousMessages';
import { generateRandomLocation } from '@/components/character/LocationSharing';
import { checkAndAwardAchievements } from '@/components/character/AchievementSystem';
import { useUserLevel } from '@/components/gamification/useUserLevel';
import { XP_REWARDS } from '@/components/gamification/LevelUtils';
import { useEquippedTheme } from '@/components/shop/useEquippedTheme';

export default function Chat() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [showPinned, setShowPinned] = useState(false);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [delayStatus, setDelayStatus] = useState(null);
  const [pendingMessages, setPendingMessages] = useState([]);
  const isProcessingRef = useRef(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  useNotifications(user);
  const { addXP } = useUserLevel(user?.email);
  const equippedTheme = useEquippedTheme(user?.email);
  
  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });
  
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', characterId],
    queryFn: () => base44.entities.ChatMessage.filter({ character_id: characterId }, 'created_date', 100),
    enabled: !!characterId
  });
  
  const { data: memories = [] } = useQuery({
    queryKey: ['memories', characterId, user?.email],
    queryFn: () => base44.entities.CharacterMemory.filter({ 
      character_id: characterId,
      user_email: user.email 
    }),
    enabled: !!characterId && !!user
  });
  
  const { data: sharedMemories = [] } = useQuery({
    queryKey: ['shared-memories', characterId, user?.email],
    queryFn: () => base44.entities.SharedMemory.filter({ 
      target_character_id: characterId,
      user_email: user.email,
      is_used: false
    }),
    enabled: !!characterId && !!user
  });
  
  const { data: allCharacters = [] } = useQuery({
    queryKey: ['all-characters-for-sharing'],
    queryFn: () => base44.entities.Character.list(),
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ['character-activities', characterId],
    queryFn: () => base44.entities.CharacterActivity.filter({ character_id: characterId }, '-created_date', 5),
    enabled: !!characterId
  });

  const { data: importantDates = [] } = useQuery({
    queryKey: ['important-dates', characterId, user?.email],
    queryFn: () => base44.entities.ImportantDate.filter({ character_id: characterId, user_email: user.email }),
    enabled: !!characterId && !!user
  });

  const [weatherState, setWeatherState] = useState(null);

  // Generate daily activity, check illness, update weather, location, spontaneous messages on chat open
  useEffect(() => {
    if (character && !character.is_archived && user) {
      generateDailyActivity(character);
      checkAndUpdateIllness(character).then(updated => {
        if (updated.illness !== character.illness || updated.just_recovered) {
          queryClient.invalidateQueries({ queryKey: ['character', characterId] });
        }
      });
      // Weather
      updateWeatherState(user.email).then(w => setWeatherState(w));
      // Location sharing (random chance)
      if (Math.random() > 0.6) {
        const loc = generateRandomLocation(character);
        base44.entities.CharacterLocation.create({ character_id: characterId, ...loc });
      }
      // Spontaneous messages
      const lastMsg = messages[messages.length - 1];
      if (shouldSendSpontaneous(character, lastMsg?.created_date)) {
        generateSpontaneousMessage(character, user).then(() => {
          queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
        });
      }
      // Check achievements
      base44.entities.Character.list().then(chars => {
        base44.entities.CharacterMemory.filter({ user_email: user.email }).then(mems => {
          base44.entities.Gift.filter({ user_email: user.email }).then(gifts => {
            checkAndAwardAchievements(user, chars, messages, mems, gifts);
          });
        });
      });
    }
  }, [character?.id, user?.email]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Mark unread assistant messages as read when opening the chat
  useEffect(() => {
    if (!messages.length || !characterId) return;
    const unreadAssistantMsgs = messages.filter(m => m.role === 'assistant' && m.status !== 'read');
    if (unreadAssistantMsgs.length === 0) return;
    
    const markAsRead = async () => {
      for (const msg of unreadAssistantMsgs) {
        await base44.entities.ChatMessage.update(msg.id, { status: 'read', read_at: new Date().toISOString() });
      }
      queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    };
    markAsRead();
  }, [messages, characterId]);
  
  const togglePinMutation = useMutation({
    mutationFn: async ({ messageId, isPinned }) => {
      await base44.entities.ChatMessage.update(messageId, { is_pinned: !isPinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
    }
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: async ({ messageId, isBookmarked }) => {
      await base44.entities.ChatMessage.update(messageId, { is_bookmarked: !isBookmarked });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
    }
  });

  // Send user message immediately, then queue AI response
  const handleSendMessage = async (content, imageUrl) => {
    // 1. Save user message immediately
    await base44.entities.ChatMessage.create({
      character_id: characterId,
      role: 'user',
      content,
      image_url: imageUrl || null,
      reply_to_id: replyToMessage?.id || null,
      status: 'sent'
    });
    setReplyToMessage(null);
    queryClient.invalidateQueries({ queryKey: ['messages', characterId] });

    // 2. Queue AI response processing
    setPendingMessages(prev => [...prev, { content, imageUrl }]);
  };

  // Process pending messages one at a time
  useEffect(() => {
    if (pendingMessages.length === 0 || isProcessingRef.current) return;
    if (!character || !user) return;

    isProcessingRef.current = true;
    const currentMsg = pendingMessages[0];

    const processAIResponse = async () => {
      // Fetch latest messages for context
      const latestMessages = await base44.entities.ChatMessage.filter({ character_id: characterId }, 'created_date', 100);

      // Check if more messages are queued – if so, skip delay & just batch into one response
      const remainingCount = pendingMessages.length;

      if (remainingCount === 1) {
        // Only one message – do normal delay + typing
        const isNag = isRepeatNag(latestMessages, currentMsg.content);
        const delay = calculateReplyDelay(character, isNag);
        const reason = getDelayReason(character);
        setDelayStatus(reason);
        
        const typingDelay = Math.min(delay, 60000);
        const preTypingWait = Math.max(0, delay - typingDelay);
        
        if (preTypingWait > 0) {
          await new Promise(resolve => setTimeout(resolve, preTypingWait));
        }
        setDelayStatus(null);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Mark all unread user messages as "read" (blue checkmarks)
      const unreadUserMsgs = latestMessages.filter(m => m.role === 'user' && m.status !== 'read');
      for (const msg of unreadUserMsgs) {
        await base44.entities.ChatMessage.update(msg.id, { status: 'read', read_at: new Date().toISOString() });
      }
      if (unreadUserMsgs.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
      }

      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 3000));

      // Consume all pending messages for context
      const allPending = [...pendingMessages];
      const combinedContent = allPending.map(m => m.content).join('\n');
      const lastImage = allPending.reverse().find(m => m.imageUrl)?.imageUrl || null;

      // Build prompt
      const { prompt, allMemories } = buildFullPrompt({
        character,
        user,
        messages: latestMessages,
        memories,
        content: combinedContent,
        imageUrl: lastImage,
        sharedMemories,
        allCharacters,
        recentActivities,
        importantDates,
        weatherState
      });

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: RESPONSE_SCHEMA,
        file_urls: lastImage ? [lastImage] : undefined
      });
      
      setIsTyping(false);
      
      // Update mood
      if (response.new_mood && response.new_mood !== character.current_mood) {
        await base44.entities.Character.update(characterId, { current_mood: response.new_mood });
        queryClient.invalidateQueries({ queryKey: ['character', characterId] });
      }
      
      // Update motivation progress
      if (response.motivation_progress_delta && character.current_motivation) {
        const newProgress = Math.min(100, Math.max(0, (character.motivation_progress || 0) + response.motivation_progress_delta));
        await base44.entities.Character.update(characterId, { motivation_progress: newProgress });
        queryClient.invalidateQueries({ queryKey: ['character', characterId] });
      }
      
      // Boost recalled memories
      if (response.recalled_memory_ids?.length > 0) {
        for (const memId of response.recalled_memory_ids) {
          const mem = allMemories.find(m => m.id === memId);
          if (mem) {
            await base44.entities.CharacterMemory.update(memId, {
              strength: Math.min(100, (mem.strength || 50) + 20),
              recall_count: (mem.recall_count || 0) + 1,
              last_recalled_date: new Date().toISOString(),
            });
          }
        }
      }

      // Process relationship changes
      if (response.relationship_changes) {
        const rc = response.relationship_changes;
        const charUpdates = {};
        if (rc.trust_delta) charUpdates.trust_level = Math.min(10, Math.max(1, (character.trust_level || 5) + rc.trust_delta));
        if (rc.jealousy_delta) charUpdates.jealousy_level = Math.min(10, Math.max(1, (character.jealousy_level || 3) + rc.jealousy_delta));
        if (rc.closeness_delta) charUpdates.empathy_level = Math.min(10, Math.max(1, (character.empathy_level || 5) + rc.closeness_delta));
        if (rc.relationship_phase) {
          const phaseToEvolution = { 'kennenlernphase': 'sich_annähernd', 'aufbauphase': 'sich_annähernd', 'vertrauensphase': 'sich_vertiefend', 'tiefe_verbindung': 'sich_vertiefend', 'krise': 'sich_entfernend', 'versöhnung': 'sich_annähernd', 'stabil': 'statisch' };
          if (phaseToEvolution[rc.relationship_phase]) charUpdates.relationship_evolution = phaseToEvolution[rc.relationship_phase];
        }
        if (Object.keys(charUpdates).length > 0) {
          await base44.entities.Character.update(characterId, charUpdates);
          queryClient.invalidateQueries({ queryKey: ['character', characterId] });
        }
        if (rc.event_type && rc.event_description) {
          const mainChange = rc.trust_delta ? 'Vertrauen' : rc.jealousy_delta ? 'Eifersucht' : rc.closeness_delta ? 'Nähe' : null;
          const oldVal = rc.trust_delta ? String(character.trust_level || 5) : rc.jealousy_delta ? String(character.jealousy_level || 3) : rc.closeness_delta ? String(character.empathy_level || 5) : null;
          const newVal = rc.trust_delta ? String(charUpdates.trust_level || character.trust_level || 5) : rc.jealousy_delta ? String(charUpdates.jealousy_level || character.jealousy_level || 3) : rc.closeness_delta ? String(charUpdates.empathy_level || character.empathy_level || 5) : null;
          await base44.entities.RelationshipEvent.create({ character_id: characterId, user_email: user.email, event_type: rc.event_type, description: rc.event_description, attribute_changed: mainChange, old_value: oldVal, new_value: newVal, impact_score: rc.impact_score || 0 });
          queryClient.invalidateQueries({ queryKey: ['relationship-events'] });
        }
      }

      // Save new memories
      if (response.new_memories?.length > 0) {
        for (const memory of response.new_memories) {
          if (memory.content && memory.importance >= 3) {
            const isDuplicate = memories.some(existing => existing.memory_text && memory.content && existing.memory_text.toLowerCase().includes(memory.content.toLowerCase().slice(0, 30)));
            if (!isDuplicate) {
              await base44.entities.CharacterMemory.create({ character_id: characterId, user_email: user.email, memory_text: memory.content, memory_type: memory.memory_type || 'fact', memory_category: memory.memory_category || 'general', importance_level: memory.importance >= 8 ? 'hoch' : memory.importance >= 5 ? 'mittel' : 'niedrig', last_interaction_date: new Date().toISOString(), strength: Math.min(100, memory.importance * 12), recall_count: 0, source: 'ai_extracted' });
            }
          }
        }
        queryClient.invalidateQueries({ queryKey: ['memories', characterId, user.email] });
      }

      // Mark used shared memories
      if (response.used_shared_memory_ids?.length > 0) {
        for (const smId of response.used_shared_memory_ids) { await base44.entities.SharedMemory.update(smId, { is_used: true }); }
        queryClient.invalidateQueries({ queryKey: ['shared-memories', characterId, user.email] });
      }
      
      // Share info with other characters
      if (response.info_to_share?.length > 0) {
        const otherChars = allCharacters.filter(c => c.id !== characterId && !c.is_archived);
        for (const info of response.info_to_share) {
          if (info.content && info.importance >= 5 && otherChars.length > 0) {
            const shareCount = Math.min(otherChars.length, Math.ceil(Math.random() * 3));
            const shuffled = [...otherChars].sort(() => Math.random() - 0.5);
            for (const target of shuffled.slice(0, shareCount)) {
              await base44.entities.SharedMemory.create({ source_character_id: characterId, target_character_id: target.id, user_email: user.email, content: info.content, share_type: info.share_type || 'gossip', accuracy: info.accuracy || 80, is_used: false });
            }
          }
        }
      }

      if (response.proactive_topic && character.proactive_topics) {
        await base44.entities.Character.update(characterId, { current_motivation: response.proactive_topic });
      }
      
      // Save AI response
      await base44.entities.ChatMessage.create({ character_id: characterId, role: 'assistant', content: response.response, status: 'delivered' });

      // Generate diary entry in background (non-blocking)
      generateDiaryEntry(character, user, latestMessages, response.new_mood).catch(() => {});

      // Award XP
      if (addXP) addXP({ xp: XP_REWARDS.send_message + XP_REWARDS.receive_reply, coins: 2 });
      
      queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });

      // Remove all processed messages from queue
      setPendingMessages(prev => prev.slice(allPending.length));
      isProcessingRef.current = false;
    };

    processAIResponse();
  }, [pendingMessages, character, user]);
  
  const defaultAvatar = character ? `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}` : '';
  
  // Filter messages based on search, pinned, or bookmarked view
  const filteredMessages = messages.filter(msg => {
    if (showPinned) return msg.is_pinned;
    if (showBookmarked) return msg.is_bookmarked;
    if (searchQuery) return msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });
  
  const pinnedCount = messages.filter(m => m.is_pinned).length;
  const bookmarkedCount = messages.filter(m => m.is_bookmarked).length;
  
  if (!character) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className={`h-screen ${equippedTheme.bg || 'bg-[#111]'} flex flex-col overflow-hidden`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5">
        <div className="flex items-center gap-3 p-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <img 
            src={character.avatar_url || defaultAvatar}
            alt={character.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          
          <Link to={createPageUrl(`CharacterInfo?characterId=${characterId}`)} className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white hover:text-emerald-400 transition-colors">{character.name}</h2>
              {character.illness && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  {getIllnessDisplay(character)?.emoji} {character.illness}
                </span>
              )}
              {character.current_mood && <MoodBadge mood={character.current_mood} size="sm" />}
              {weatherState && <WeatherBadge weather={weatherState.weather} temperature={weatherState.temperature} />}
            </div>
            <p className="text-xs text-gray-400 truncate">
              {isTyping ? (
                <span className="text-emerald-400">schreibt...</span>
              ) : delayStatus ? (
                <span className="text-amber-400">{delayStatus}</span>
              ) : (() => {
                const avail = getCharacterAvailability(character);
                if (avail.status === 'online') return <span className="text-emerald-400">online</span>;
                if (avail.status === 'away') return <span className="text-amber-400">{avail.label}</span>;
                return <span className="text-gray-500">{avail.label}</span>;
              })()}
            </p>
          </Link>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              setShowSearch(!showSearch);
              setSearchQuery('');
              setShowPinned(false);
            }}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Search className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              setShowPinned(!showPinned);
              setShowBookmarked(false);
              setShowSearch(false);
              setSearchQuery('');
            }}
            className={`text-gray-400 hover:text-white hover:bg-white/10 relative ${showPinned ? 'text-emerald-400' : ''}`}
          >
            <Pin className="w-5 h-5" />
            {pinnedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {pinnedCount}
              </span>
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              setShowBookmarked(!showBookmarked);
              setShowPinned(false);
              setShowSearch(false);
              setSearchQuery('');
            }}
            className={`text-gray-400 hover:text-white hover:bg-white/10 relative ${showBookmarked ? 'text-amber-400' : ''}`}
          >
            <Bookmark className={`w-5 h-5 ${showBookmarked ? 'fill-amber-400' : ''}`} />
            {bookmarkedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {bookmarkedCount}
              </span>
            )}
          </Button>

          <ExportChatButton messages={messages} characterName={character.name} />
          <ShareChatButton messages={messages} character={character} />

          <Link to={createPageUrl(`CharacterInfo?characterId=${characterId}`)}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <Info className="w-5 h-5" />
            </Button>
          </Link>
        </div>
        
        {/* Search Bar */}
        {showSearch && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nachrichten durchsuchen..."
                className="w-full bg-[#262626] border-0 text-white pl-10 pr-10 rounded-xl placeholder-gray-500 focus-visible:ring-emerald-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Pinned/Search Info */}
        {(showPinned || showBookmarked || searchQuery) && (
          <div className="px-4 pb-2 flex items-center justify-between">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              {showPinned && <span>📌 {pinnedCount} gepinnte Nachricht{pinnedCount !== 1 ? 'en' : ''}</span>}
              {showBookmarked && <span>🔖 {bookmarkedCount} markierte Nachricht{bookmarkedCount !== 1 ? 'en' : ''}</span>}
              {searchQuery && <span>🔍 {filteredMessages.length} Ergebnis{filteredMessages.length !== 1 ? 'se' : ''}</span>}
            </div>
            <button
              onClick={() => { setShowPinned(false); setShowBookmarked(false); setShowSearch(false); setSearchQuery(''); }}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              Alle anzeigen
            </button>
          </div>
        )}
      </header>
      
      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {/* Greeting */}
        {!showPinned && !searchQuery && messages.length === 0 && character.greeting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MessageBubble
              message={{ role: 'assistant', content: character.greeting, created_date: character.created_date }}
              characterAvatar={character.avatar_url}
              characterName={character.name}
            />
          </motion.div>
        )}
        
        <AnimatePresence>
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <MessageBubble
                message={message}
                characterAvatar={character.avatar_url}
                characterName={character.name}
                onPin={(msg) => togglePinMutation.mutate({ messageId: msg.id, isPinned: msg.is_pinned })}
                onBookmark={(msg) => toggleBookmarkMutation.mutate({ messageId: msg.id, isBookmarked: msg.is_bookmarked })}
                onReply={(msg) => setReplyToMessage(msg)}
                replyToMessage={message.reply_to_id ? messages.find(m => m.id === message.reply_to_id) : null}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center"
          >
            <img 
              src={character.avatar_url || defaultAvatar}
              alt={character.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className={`${equippedTheme.messageBg || 'bg-[#262626]'} rounded-2xl px-4 py-3 rounded-bl-md`}>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </main>
      
      {/* Input */}
      <div className="shrink-0 bg-[#1a1a1a] border-t border-white/5 p-4">
        <ChatInput 
          onSend={(content, imageUrl) => handleSendMessage(content, imageUrl)}
          isLoading={false}
          replyToMessage={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
        />
      </div>
    </div>
  );
}