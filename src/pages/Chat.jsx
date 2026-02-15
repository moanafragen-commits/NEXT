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
import { calculateReplyDelay, getDelayReason } from '@/components/chat/ReplyDelayCalculator';
import { buildFullPrompt, RESPONSE_SCHEMA } from '@/components/chat/PromptBuilder';

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

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  useNotifications(user);
  
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
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
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

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, imageUrl }) => {
      // Save user message
      const userMsg = await base44.entities.ChatMessage.create({
        character_id: characterId,
        role: 'user',
        content,
        image_url: imageUrl || null,
        reply_to_id: replyToMessage?.id || null,
        status: 'sent'
      });
      setReplyToMessage(null);
      
      queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
      
      // Realistic reply delay based on character traits
      const delay = calculateReplyDelay(character);
      const reason = getDelayReason(character);
      setDelayStatus(reason);
      
      const typingDelay = Math.min(delay, 60000);
      const preTypingWait = Math.max(0, delay - typingDelay);
      
      if (preTypingWait > 0) {
        await new Promise(resolve => setTimeout(resolve, preTypingWait));
      }
      
      // Character "reads" the message
      await base44.entities.ChatMessage.update(userMsg.id, {
        status: 'read',
        read_at: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
      
      setDelayStatus(null);
      setIsTyping(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 3000));
      
      // Build prompt using PromptBuilder
      const { prompt, allMemories } = buildFullPrompt({
        character,
        user,
        messages,
        memories,
        content,
        imageUrl
      });

      // Get AI response
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: RESPONSE_SCHEMA,
        file_urls: imageUrl ? [imageUrl] : undefined
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

        if (rc.trust_delta || rc.jealousy_delta) {
          const updates = {};
          if (rc.trust_delta) {
            updates.trust_level = Math.min(10, Math.max(1, (character.trust_level || 5) + rc.trust_delta));
          }
          if (rc.jealousy_delta) {
            updates.jealousy_level = Math.min(10, Math.max(1, (character.jealousy_level || 3) + rc.jealousy_delta));
          }
          await base44.entities.Character.update(characterId, updates);
          queryClient.invalidateQueries({ queryKey: ['character', characterId] });
        }

        if (rc.event_type && rc.event_description) {
          await base44.entities.RelationshipEvent.create({
            character_id: characterId,
            user_email: user.email,
            event_type: rc.event_type,
            description: rc.event_description,
            attribute_changed: rc.trust_delta ? 'Vertrauen' : rc.jealousy_delta ? 'Eifersucht' : null,
            old_value: rc.trust_delta ? String((character.trust_level || 5)) : rc.jealousy_delta ? String((character.jealousy_level || 3)) : null,
            new_value: rc.trust_delta ? String(Math.min(10, Math.max(1, (character.trust_level || 5) + rc.trust_delta))) : rc.jealousy_delta ? String(Math.min(10, Math.max(1, (character.jealousy_level || 3) + rc.jealousy_delta))) : null,
            impact_score: rc.impact_score || 0
          });
          queryClient.invalidateQueries({ queryKey: ['relationship-events'] });
        }
      }

      // Save new memories (lower threshold for more comprehensive memory)
      if (response.new_memories?.length > 0) {
        for (const memory of response.new_memories) {
          if (memory.content && memory.importance >= 3) {
            // Check for duplicate memories
            const isDuplicate = memories.some(existing => 
              existing.memory_text && memory.content &&
              existing.memory_text.toLowerCase().includes(memory.content.toLowerCase().slice(0, 30))
            );
            
            if (!isDuplicate) {
              await base44.entities.CharacterMemory.create({
                character_id: characterId,
                user_email: user.email,
                memory_text: memory.content,
                memory_type: memory.memory_type || 'fact',
                memory_category: memory.memory_category || 'general',
                importance_level: memory.importance >= 8 ? 'hoch' : memory.importance >= 5 ? 'mittel' : 'niedrig',
                last_interaction_date: new Date().toISOString(),
                strength: Math.min(100, memory.importance * 12),
                recall_count: 0,
                source: 'ai_extracted',
              });
            }
          }
        }
        queryClient.invalidateQueries({ queryKey: ['memories', characterId, user.email] });
      }

      // Store proactive topic for next conversation
      if (response.proactive_topic && character.proactive_topics) {
        await base44.entities.Character.update(characterId, {
          current_motivation: response.proactive_topic
        });
      }
      
      // Generate response image occasionally
      let aiImageUrl = null;
      if (Math.random() < 0.15 && character.category !== 'Assistent') {
        try {
          const styleHint = character.writing_style === 'poetisch' ? 'artistic, dreamy' :
                           character.writing_style === 'humorvoll' ? 'fun, lighthearted' :
                           character.writing_style === 'mysteriös' ? 'mysterious, atmospheric' : 'natural, authentic';

          const imgResponse = await base44.integrations.Core.GenerateImage({
            prompt: `Portrait of ${character.name}. ${styleHint}. Context: ${response.response.slice(0, 100)}. High quality, cinematic.`,
            existing_image_urls: imageUrl ? [imageUrl] : undefined
          });
          aiImageUrl = imgResponse.url;
        } catch (e) {
          // Ignore
        }
      }

      // Save AI response
      await base44.entities.ChatMessage.create({
        character_id: characterId,
        role: 'assistant',
        content: response.response,
        image_url: aiImageUrl,
        status: 'delivered'
      });
      
      queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    }
  });
  
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
    <div className="h-screen bg-[#111] flex flex-col overflow-hidden">
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
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white">{character.name}</h2>
              {character.current_mood && <MoodBadge mood={character.current_mood} size="sm" />}
            </div>
            <p className="text-xs text-gray-400 truncate">
              {isTyping ? (
                <span className="text-emerald-400">schreibt...</span>
              ) : delayStatus ? (
                <span className="text-amber-400">{delayStatus}</span>
              ) : (
                character.status || 'online'
              )}
            </p>
          </div>
          
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
            <div className="bg-[#262626] rounded-2xl px-4 py-3 rounded-bl-md">
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
          onSend={(content, imageUrl) => sendMessageMutation.mutate({ content, imageUrl })}
          isLoading={sendMessageMutation.isPending || isTyping}
          replyToMessage={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
        />
      </div>
    </div>
  );
}