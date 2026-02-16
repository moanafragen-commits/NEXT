import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { calculateReplyDelay, getCharacterAvailability, isRepeatNag } from '@/components/chat/ReplyDelayCalculator';
import { useUserLevel } from '@/components/gamification/useUserLevel';
import { XP_REWARDS } from '@/components/gamification/LevelUtils';

export default function ChatSidebar({ character, onClose, userEmail }) {
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const { addXP } = useUserLevel(userEmail);

  const avatar = character.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['messages', character.id],
    queryFn: () => base44.entities.ChatMessage.filter({ character_id: character.id }, 'created_date', 50),
    enabled: !!character.id
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.ChatMessage.create({ character_id: character.id, role: 'user', content });
      await queryClient.invalidateQueries({ queryKey: ['messages', character.id] });

      const isNag = isRepeatNag(chatMessages, content);
      const delay = calculateReplyDelay(character, isNag);
      const preWait = Math.max(0, Math.min(delay - 3000, 15000));
      if (preWait > 0) await new Promise(r => setTimeout(r, preWait));

      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));

      const history = chatMessages.slice(-10).map(m => `${m.role === 'user' ? 'Nutzer' : character.name}: ${m.content}`).join('\n');
      const now = new Date();

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${character.name}. ${character.personality}
Schreibstil: ${character.writing_style || 'freundlich'}. ${character.response_length === 'kurz' ? 'Halte dich kurz.' : ''}
${character.custom_instructions || ''}
Datum: ${now.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}

Chatverlauf:
${history}

Nutzer: ${content}

Antworte als ${character.name}. Bleibe in deiner Rolle.`,
        response_json_schema: { type: "object", properties: { response: { type: "string" } } }
      });

      await base44.entities.ChatMessage.create({ character_id: character.id, role: 'assistant', content: response.response });
      return response;
    },
    onSettled: () => {
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ['messages', character.id] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
      if (addXP) addXP({ xp: XP_REWARDS.send_message + XP_REWARDS.receive_reply, coins: 2 });
    }
  });

  const handleSend = () => {
    if (!chatMessage.trim() || isTyping || sendMutation.isPending) return;
    sendMutation.mutate(chatMessage);
    setChatMessage('');
  };

  const avail = getCharacterAvailability(character);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#111] border-l border-white/10 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-[#1a1a1a]">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
          <img src={avatar} alt={character.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30" />
          <div className="flex-1">
            <h3 className="font-semibold text-white">{character.name}</h3>
            <p className="text-xs">
              {isTyping ? (
                <span className="text-emerald-400">schreibt...</span>
              ) : avail.status === 'online' ? (
                <span className="text-emerald-400">online</span>
              ) : avail.status === 'away' ? (
                <span className="text-amber-400">{avail.label}</span>
              ) : (
                <span className="text-gray-500">{avail.label}</span>
              )}
            </p>
          </div>
          <Link to={createPageUrl(`Chat?characterId=${character.id}`)}>
            <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 text-xs">Vollbild</Button>
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.length === 0 && character.greeting && (
            <div className="flex gap-2">
              <img src={avatar} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
              <div className="bg-white/5 rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%]">
                <p className="text-sm text-gray-200 leading-relaxed">{character.greeting}</p>
              </div>
            </div>
          )}
          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <img src={avatar} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
              )}
              <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-md'
                  : 'bg-white/5 text-gray-200 rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 items-center">
              <img src={avatar} className="w-7 h-7 rounded-full object-cover" />
              <div className="bg-white/5 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-[#1a1a1a]">
          <div className="flex items-end gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Nachricht..."
              className="flex-1 bg-white/5 text-white rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40 placeholder-gray-600 border border-white/5"
              disabled={isTyping}
            />
            {chatMessage.trim() && (
              <Button
                onClick={handleSend}
                disabled={isTyping || sendMutation.isPending}
                size="icon"
                className="h-11 w-11 rounded-full bg-emerald-600 hover:bg-emerald-500 shrink-0"
              >
                {isTyping || sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}