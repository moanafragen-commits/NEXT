import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Phone, Video, MoreVertical, Loader2, Info, Search, X, Pin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/components/notifications/NotificationManager';

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
    queryKey: ['memories', characterId],
    queryFn: () => base44.entities.CharacterMemory.filter({ character_id: characterId }, '-importance', 20),
    enabled: !!characterId
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
      setIsTyping(true);
      
      // Build conversation history with more context (last 20 messages)
      const history = messages.slice(-20).map(m => ({
        role: m.role,
        content: m.content,
        has_image: !!m.image_url
      }));
      
      // Build character context
      const bioContext = character.biography ? `\n\nHintergrundgeschichte:\n${character.biography}` : '';
      const styleContext = character.writing_style ? `Schreibstil: ${character.writing_style}.` : '';
      const lengthContext = character.response_length === 'kurz' ? 'Halte dich kurz (1-2 Sätze).' : 
                           character.response_length === 'ausführlich' ? 'Antworte ausführlich und detailliert.' : '';
      const langContext = character.language_preference === 'Englisch' ? 'Antworte auf Englisch.' :
                         character.language_preference === 'Mehrsprachig' ? 'Antworte in der Sprache, die der Nutzer verwendet.' : 'Antworte auf Deutsch.';
      const customContext = character.custom_instructions ? `\n\nZusätzliche Anweisungen: ${character.custom_instructions}` : '';
      
      // Build memory context
      const memoryContext = memories.length > 0 ? `\n\nWas du über den Nutzer weißt (aus früheren Gesprächen):\n${memories.map(m => `- ${m.content}`).join('\n')}` : '';
      
      // Current date and time
      const now = new Date();
      const dateTimeContext = `\n\nAktuelles Datum: ${now.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\nAktuelle Uhrzeit: ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
      
      // Build enhanced prompt with image support
      const imageContext = imageUrl ? `\n\nDer Nutzer hat ein Bild gesendet. Reagiere darauf in deiner Antwort (z.B. "Schönes Bild!", "Das sieht interessant aus!", etc.).` : '';
      
      const conversationSummary = history.length > 15 ? `\n\nKurzzusammenfassung des bisherigen Gesprächs: Die letzten ${history.length} Nachrichten zeigen eine fortlaufende Unterhaltung mit verschiedenen Themen.` : '';

      // Get AI response with memory extraction and image support
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${character.name}. ${character.personality}${bioContext}${memoryContext}${dateTimeContext}${conversationSummary}

WICHTIGE VERHALTENSREGELN:
- Bleibe IMMER in deiner Rolle als ${character.name}
- Deine Antworten sollten natürlich und authentisch wirken
- Beziehe dich auf frühere Gespräche und gemeinsame Erlebnisse
- Zeige Emotionen und Persönlichkeit
- Stelle auch mal Gegenfragen
- Verwende gelegentlich Emojis wenn es zu deinem Charakter passt
${styleContext} ${lengthContext} ${langContext}${customContext}${imageContext}

Bisheriger Chatverlauf (letzte ${history.length} Nachrichten):
${history.map(h => `${h.role === 'user' ? 'Nutzer' : character.name}: ${h.content}${h.has_image ? ' [Bild gesendet]' : ''}`).join('\n')}

Nutzer: ${content}${imageUrl ? ' [Bild gesendet]' : ''}

AUFGABEN:
1. Antworte als ${character.name} authentisch und in Rolle
2. Nutze Kontext aus bisherigen Gesprächen
3. Extrahiere neue wichtige Infos über den Nutzer für zukünftige Gespräche`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            new_memories: { 
              type: "array", 
              items: {
                type: "object",
                properties: {
                  content: { type: "string", description: "Die zu merkende Information" },
                  memory_type: { type: "string", enum: ["fact", "preference", "event", "emotion", "relationship"] },
                  importance: { type: "number", description: "Wichtigkeit 1-10" }
                }
              },
              description: "Neue wichtige Informationen über den Nutzer (leer lassen wenn keine neuen Infos)"
            }
          }
        }
      });
      
      setIsTyping(false);
      
      // Save new memories
      if (response.new_memories && response.new_memories.length > 0) {
        for (const memory of response.new_memories) {
          if (memory.content && memory.importance >= 5) {
            await base44.entities.CharacterMemory.create({
              character_id: characterId,
              content: memory.content,
              memory_type: memory.memory_type || 'fact',
              importance: memory.importance || 5
            });
          }
        }
        queryClient.invalidateQueries({ queryKey: ['memories', characterId] });
      }
      
      // Mark user message as read
      await base44.entities.ChatMessage.update(userMsg.id, {
        status: 'read',
        read_at: new Date().toISOString()
      });

      // Generate response image if needed (occasionally for variety)
      let aiImageUrl = null;
      if (Math.random() < 0.15 && character.category !== 'Assistent') { // 15% chance
        try {
          const imgResponse = await base44.integrations.Core.GenerateImage({
            prompt: `${character.name}, ${character.personality}. Create an image that fits the context: ${response.response.slice(0, 100)}`,
            existing_image_urls: imageUrl ? [imageUrl] : undefined
          });
          aiImageUrl = imgResponse.url;
        } catch (e) {
          // Ignore if image generation fails
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
  
  // Filter messages based on search or pinned view
  const filteredMessages = messages.filter(msg => {
    if (showPinned) return msg.is_pinned;
    if (searchQuery) return msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });
  
  const pinnedCount = messages.filter(m => m.is_pinned).length;
  
  if (!character) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#111] flex flex-col">
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
            <h2 className="font-semibold text-white">{character.name}</h2>
            <p className="text-xs text-gray-400 truncate">
              {isTyping ? <span className="text-emerald-400">schreibt...</span> : (character.status || 'online')}
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
        {(showPinned || searchQuery) && (
          <div className="px-4 pb-2">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              {showPinned && <span>📌 {pinnedCount} gepinnte Nachricht{pinnedCount !== 1 ? 'en' : ''}</span>}
              {searchQuery && <span>🔍 {filteredMessages.length} Ergebnis{filteredMessages.length !== 1 ? 'se' : ''}</span>}
            </div>
          </div>
        )}
      </header>
      
      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
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
      <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-white/5 p-4">
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