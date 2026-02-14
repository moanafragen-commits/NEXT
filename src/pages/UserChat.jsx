import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/components/notifications/NotificationManager';

export default function UserChat() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipientEmail = urlParams.get('userEmail');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  useNotifications(user);

  const { data: recipient } = useQuery({
    queryKey: ['recipient', recipientEmail],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: recipientEmail });
      return users[0];
    },
    enabled: !!recipientEmail
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['user-messages', recipientEmail],
    queryFn: async () => {
      const sent = await base44.entities.UserMessage.filter({
        sender_email: user.email,
        recipient_email: recipientEmail
      });
      const received = await base44.entities.UserMessage.filter({
        sender_email: recipientEmail,
        recipient_email: user.email
      });
      return [...sent, ...received].sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
      );
    },
    enabled: !!user && !!recipientEmail
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !messages.length) return;

    const markAsRead = async () => {
      const unreadMessages = messages.filter(m => m.sender_email === recipientEmail);
      const reads = await base44.entities.MessageRead.filter({ user_email: user.email, message_type: 'user' });
      const readIds = new Set(reads.map(r => r.message_id));
      
      const toMark = unreadMessages.filter(m => !readIds.has(m.id));
      
      for (const msg of toMark) {
        await base44.entities.MessageRead.create({
          message_id: msg.id,
          message_type: 'user',
          user_email: user.email
        });
      }
      
      if (toMark.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['unread-user-messages'] });
      }
    };

    markAsRead();
  }, [messages, user, recipientEmail, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.UserMessage.create({
        sender_email: user.email,
        recipient_email: recipientEmail,
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages', recipientEmail] });
      setMessage('');
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  if (!recipient) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5">
        <div className="flex items-center gap-3 p-3">
          <Link to={createPageUrl('UserChats')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
            {recipient.full_name?.[0] || recipient.email[0].toUpperCase()}
          </div>
          
          <div className="flex-1">
            <h2 className="font-semibold">{recipient.full_name || recipient.email}</h2>
            <p className="text-xs text-gray-400">online</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => {
            const isOwn = msg.sender_email === user?.email;
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {recipient.full_name?.[0] || recipient.email[0].toUpperCase()}
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-2.5 max-w-[75%] ${
                  isOwn
                    ? 'bg-emerald-600 text-white rounded-br-md'
                    : 'bg-[#262626] text-gray-100 rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Nachricht schreiben..."
              className="w-full bg-[#262626] text-white rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-500"
              disabled={sendMessageMutation.isPending}
            />
          </div>
          {message.trim() && (
            <Button
              onClick={handleSend}
              disabled={sendMessageMutation.isPending}
              size="icon"
              className="h-11 w-11 rounded-full bg-emerald-600 hover:bg-emerald-500 flex-shrink-0"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}