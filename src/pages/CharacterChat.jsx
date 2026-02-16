import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterChatSelector from '@/components/c2c/CharacterChatSelector';
import CharacterChatBubble from '@/components/c2c/CharacterChatBubble';

export default function CharacterChat() {
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get('id');
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayRef = useRef(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: conversation } = useQuery({
    queryKey: ['c2c-conversation', conversationId],
    queryFn: async () => {
      const convs = await base44.entities.CharacterConversation.filter({ id: conversationId });
      return convs[0];
    },
    enabled: !!conversationId
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['c2c-messages', conversationId],
    queryFn: () => base44.entities.CharacterConversationMessage.filter({ conversation_id: conversationId }, 'created_date', 100),
    enabled: !!conversationId,
    refetchInterval: isGenerating ? 2000 : false
  });

  const charA = characters.find(c => c.id === conversation?.character_a_id);
  const charB = characters.find(c => c.id === conversation?.character_b_id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  const generateNextMessage = async () => {
    if (!charA || !charB || !conversation) return;
    setIsGenerating(true);

    const lastMsg = messages[messages.length - 1];
    const nextSender = !lastMsg || lastMsg.sender_character_id === charB.id ? charA : charB;
    const otherChar = nextSender.id === charA.id ? charB : charA;

    const history = messages.slice(-15).map(m => {
      const sender = m.sender_character_id === charA.id ? charA : charB;
      return `${sender.name}: ${m.content}`;
    }).join('\n');

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Du bist ${nextSender.name}. ${(nextSender.personality || '').slice(0, 300)}
Schreibstil: ${nextSender.writing_style || 'freundlich'}
Stimmung: ${nextSender.current_mood || 'neutral'}

Du chattest mit ${otherChar.name} (${(otherChar.personality || '').slice(0, 150)}).
${conversation.topic ? `Thema: ${conversation.topic}` : ''}

Bisheriger Verlauf:
${history || '(Noch keine Nachrichten - beginne das Gespräch!)'}

Antworte als ${nextSender.name}. Kurz und natürlich (1-3 Sätze). Wie ein echter Chat.`,
      response_json_schema: {
        type: "object",
        properties: { message: { type: "string" } }
      }
    });

    await base44.entities.CharacterConversationMessage.create({
      conversation_id: conversationId,
      sender_character_id: nextSender.id,
      content: response.message
    });

    await base44.entities.CharacterConversation.update(conversationId, {
      message_count: (conversation.message_count || 0) + 1
    });

    queryClient.invalidateQueries({ queryKey: ['c2c-messages', conversationId] });
    queryClient.invalidateQueries({ queryKey: ['c2c-conversation', conversationId] });
    setIsGenerating(false);

    // Auto-play next
    if (autoPlayRef.current) {
      setTimeout(() => {
        if (autoPlayRef.current) generateNextMessage();
      }, 2000 + Math.random() * 3000);
    }
  };

  // Show selector if no conversation
  if (!conversationId) {
    return <CharacterChatSelector user={user} characters={characters} />;
  }

  if (!conversation || !charA || !charB) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-3">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('CharacterChat')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={charA.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${charA.name}`} className="w-8 h-8 rounded-full object-cover" />
            <span className="text-white/50 text-sm">💬</span>
            <img src={charB.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${charB.name}`} className="w-8 h-8 rounded-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">{charA.name} & {charB.name}</h2>
            {conversation.topic && <p className="text-xs text-gray-500 truncate">{conversation.topic}</p>}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <CharacterChatBubble key={msg.id} message={msg} charA={charA} charB={charB} index={i} />
          ))}
        </AnimatePresence>

        {isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-2">
            <div className="flex gap-1 bg-[#262626] rounded-2xl px-4 py-3">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Controls */}
      <div className="shrink-0 bg-[#1a1a1a] border-t border-white/5 p-4">
        <div className="flex items-center gap-3 justify-center">
          <Button
            onClick={generateNextMessage}
            disabled={isGenerating}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl px-6"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Nächste Nachricht
          </Button>

          <Button
            variant={autoPlay ? "default" : "outline"}
            onClick={() => {
              const newState = !autoPlay;
              setAutoPlay(newState);
              if (newState && !isGenerating) generateNextMessage();
            }}
            className={`rounded-xl ${autoPlay ? 'bg-amber-600 hover:bg-amber-500' : 'border-white/10 text-gray-400 hover:text-white'}`}
          >
            {autoPlay ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {autoPlay ? 'Stopp' : 'Auto-Play'}
          </Button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          Du liest mit, wie deine Charaktere miteinander chatten
        </p>
      </div>
    </div>
  );
}