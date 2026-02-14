import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function ChatView() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.AICharacter.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', characterId, user?.email],
    queryFn: () => base44.entities.Message.filter({
      character_id: characterId,
      user_email: user?.email || 'guest'
    }, 'created_date', 100),
    enabled: !!characterId && !!user?.email
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.Message.create({
        character_id: characterId,
        user_email: user?.email || 'guest',
        role: 'user',
        content
      });

      queryClient.invalidateQueries({ queryKey: ['messages', characterId, user?.email] });
      setIsTyping(true);

      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const now = new Date();
      const dateTimeContext = `Aktuelles Datum: ${now.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\nAktuelle Uhrzeit: ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${character.personality_prompt}

${dateTimeContext}

${character.example_dialogues ? `Beispiel-Dialoge:\n${character.example_dialogues}\n\n` : ''}Bisheriger Chat:
${history.map(h => `${h.role === 'user' ? 'User' : character.name}: ${h.content}`).join('\n')}

User: ${content}

Antworte als ${character.name}. Bleibe in der Rolle.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }
          }
        }
      });

      setIsTyping(false);

      await base44.entities.Message.create({
        character_id: characterId,
        user_email: user?.email || 'guest',
        role: 'assistant',
        content: response.response
      });

      queryClient.invalidateQueries({ queryKey: ['messages', characterId, user?.email] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;
    sendMessageMutation.mutate(message);
    setMessage('');
  };

  const defaultAvatar = (name) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

  if (!character) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={createPageUrl('Characters')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <img
            src={character.avatar_url || defaultAvatar(character.name)}
            alt={character.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="font-semibold">{character.name}</h2>
            <p className="text-xs text-gray-500">
              {isTyping ? <span className="text-purple-400">typing...</span> : 'online'}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <img
              src={character.avatar_url || defaultAvatar(character.name)}
              alt={character.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">{character.name}</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">{character.bio}</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <img
                  src={character.avatar_url || defaultAvatar(character.name)}
                  alt={character.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'bg-white/10 text-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className={`text-xs text-gray-600 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {format(new Date(msg.created_date), 'HH:mm', { locale: de })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center"
          >
            <img
              src={character.avatar_url || defaultAvatar(character.name)}
              alt={character.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="bg-white/10 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="border-t border-white/10 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..."
            className="bg-white/5 border-white/10 text-white flex-1"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!message.trim() || isTyping}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}