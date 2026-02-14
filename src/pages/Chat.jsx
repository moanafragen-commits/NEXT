import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Phone, Video, MoreVertical, Loader2, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  
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
  
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      // Save user message
      await base44.entities.ChatMessage.create({
        character_id: characterId,
        role: 'user',
        content
      });
      
      queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
      setIsTyping(true);
      
      // Build conversation history
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
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
      
      // Get AI response with memory extraction
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${character.name}. ${character.personality}${bioContext}${memoryContext}${dateTimeContext}

${styleContext} ${lengthContext} ${langContext}${customContext}

Bisheriger Chatverlauf:
${history.map(h => `${h.role === 'user' ? 'Nutzer' : character.name}: ${h.content}`).join('\n')}

Nutzer: ${content}

Antworte als ${character.name}. Bleibe in deiner Rolle. Nutze dein Wissen über den Nutzer, um die Konversation persönlicher zu gestalten.

Extrahiere außerdem wichtige neue Informationen über den Nutzer (Name, Vorlieben, Fakten, Emotionen, Ereignisse) die du dir merken solltest.`,
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
      
      // Save AI response
      await base44.entities.ChatMessage.create({
        character_id: characterId,
        role: 'assistant',
        content: response.response
      });
      
      queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    }
  });
  
  const defaultAvatar = character ? `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}` : '';
  
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
          
          <Link to={createPageUrl(`CharacterInfo?characterId=${characterId}`)}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <Info className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Greeting */}
        {messages.length === 0 && character.greeting && (
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
          {messages.map((message, index) => (
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
      <ChatInput 
        onSend={(content) => sendMessageMutation.mutate(content)}
        isLoading={sendMessageMutation.isPending || isTyping}
      />
    </div>
  );
}