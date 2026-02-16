import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
}

function ChatBubble({ message, managerName, managerEmoji }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm flex-shrink-0 mt-1">
          {managerEmoji || '👤'}
        </div>
      )}
      <div className={`max-w-[80%]`}>
        {!isUser && (
          <p className="text-[10px] text-purple-400 mb-0.5 ml-1">{managerName}</p>
        )}
        <div className={`rounded-2xl px-3.5 py-2.5 ${
          isUser
            ? 'bg-emerald-600 text-white rounded-br-md'
            : 'bg-[#262626] text-gray-100 rounded-bl-md'
        }`}>
          <ReactMarkdown className="text-sm prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:my-0">
            {message.content}
          </ReactMarkdown>
        </div>
        <p className={`text-[10px] text-gray-500 mt-0.5 ${isUser ? 'text-right' : ''}`}>
          {formatTime(message.created_date)}
        </p>
      </div>
    </div>
  );
}

export default function JobChat({ job, userEmail }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['job-chat', job.id],
    queryFn: () => base44.entities.JobChatMessage.filter({ job_id: job.id, user_email: userEmail }, 'created_date', 100),
    enabled: !!job.id && !!userEmail
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      // Save user message
      await base44.entities.JobChatMessage.create({
        job_id: job.id,
        user_email: userEmail,
        role: 'user',
        content,
        status: 'sent'
      });

      queryClient.invalidateQueries({ queryKey: ['job-chat', job.id] });
      setIsTyping(true);

      // Fetch open tasks for context
      const tasks = await base44.entities.JobTask.filter({ job_id: job.id, user_email: userEmail }, '-created_date', 10);
      const taskCtx = tasks.slice(0, 5).map(t => `- ${t.title} (${t.status}, Prio: ${t.priority})`).join('\n');

      // Build recent chat history
      const latestMsgs = await base44.entities.JobChatMessage.filter({ job_id: job.id, user_email: userEmail }, 'created_date', 20);
      const chatHistory = latestMsgs.slice(-10).map(m =>
        `${m.role === 'user' ? 'Mitarbeiter' : job.manager_name}: ${m.content}`
      ).join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${job.manager_name}, Manager bei ${job.employer}.
Dein Mitarbeiter arbeitet als "${job.job_title}".
Jobbeschreibung: ${job.description}

AKTUELLE AUFGABEN:
${taskCtx || 'Keine offenen Aufgaben'}

CHATVERLAUF:
${chatHistory}

Mitarbeiter: ${content}

Antworte als ${job.manager_name}. Sei professionell aber freundlich. Beziehe dich auf aktuelle Aufgaben wenn relevant.
Gib bei Bedarf neue Anweisungen oder Feedback. Halte die Antwort kurz (2-4 Sätze).
Schreibe auf Deutsch.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }
          }
        }
      });

      setIsTyping(false);

      await base44.entities.JobChatMessage.create({
        job_id: job.id,
        user_email: userEmail,
        role: 'manager',
        content: result.response,
        status: 'delivered'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-chat', job.id] });
    },
    onError: () => {
      setIsTyping(false);
    }
  });

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    const msg = input.trim();
    setInput('');
    sendMutation.mutate(msg);
  };

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden flex flex-col" style={{ height: '400px' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 bg-[#1a1a1a]">
        <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
          {job.icon_emoji || '💼'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{job.manager_name}</p>
          <p className="text-[10px] text-gray-500">{job.employer} • {job.job_title}</p>
        </div>
        {isTyping && (
          <span className="text-[10px] text-purple-400 animate-pulse">schreibt...</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Briefcase className="w-8 h-8 text-purple-400/30 mb-2" />
            <p className="text-xs text-gray-500">Arbeitschat mit {job.manager_name}</p>
            <p className="text-[10px] text-gray-600 mt-1">Schreibe eine Nachricht um loszulegen</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <ChatBubble
                  message={msg}
                  managerName={job.manager_name}
                  managerEmoji={job.icon_emoji}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {isTyping && (
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm">
              {job.icon_emoji || '👤'}
            </div>
            <div className="bg-[#262626] rounded-2xl px-4 py-3 rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5 flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
          placeholder={`Nachricht an ${job.manager_name}...`}
          className="flex-1 bg-[#262626] border-0 text-white placeholder-gray-500 rounded-xl focus-visible:ring-purple-500/50"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sendMutation.isPending}
          size="icon"
          className="bg-purple-600 hover:bg-purple-500 rounded-xl h-9 w-9 disabled:opacity-30"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}