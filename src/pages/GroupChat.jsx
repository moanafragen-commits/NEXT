import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, UserPlus, Settings, Send, Loader2, Users as UsersIcon, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ChatInput from '@/components/chat/ChatInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import AddUserModal from '@/components/groupchat/AddUserModal';
import { useNotifications } from '@/components/notifications/NotificationManager';

export default function GroupChat() {
  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get('groupId');
  const [message, setMessage] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  useNotifications(user);

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const groups = await base44.entities.GroupChat.filter({ id: groupId });
      return groups[0];
    },
    enabled: !!groupId
  });

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => base44.entities.GroupChatMember.filter({ group_id: groupId }),
    enabled: !!groupId
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['group-messages', groupId],
    queryFn: () => base44.entities.GroupChatMessage.filter({ group_id: groupId }, 'created_date', 100),
    enabled: !!groupId
  });

  const { data: allMemories = [] } = useQuery({
    queryKey: ['all-memories', user?.email],
    queryFn: () => base44.entities.CharacterMemory.filter({ user_email: user.email }),
    enabled: !!user
  });

  const characterMembers = members.filter(m => m.member_type === 'character');
  const userMembers = members.filter(m => m.member_type === 'user');
  const availableCharacters = characters.filter(c => 
    !characterMembers.some(m => m.member_id === c.id)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!user || !messages.length) return;

    const markAsRead = async () => {
      const unreadMessages = messages.filter(m => m.sender_id !== user.email);
      const reads = await base44.entities.MessageRead.filter({ user_email: user.email, message_type: 'group' });
      const readIds = new Set(reads.map(r => r.message_id));
      
      const toMark = unreadMessages.filter(m => !readIds.has(m.id));
      
      for (const msg of toMark) {
        await base44.entities.MessageRead.create({
          message_id: msg.id,
          message_type: 'group',
          user_email: user.email
        });
      }
      
      if (toMark.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['unread-group-messages'] });
      }
    };

    markAsRead();
  }, [messages, user, queryClient]);

  const addMembersMutation = useMutation({
    mutationFn: async () => {
      const promises = selectedCharacters.map(charId =>
        base44.entities.GroupChatMember.create({
          group_id: groupId,
          member_type: 'character',
          member_id: charId
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      setShowAddMember(false);
      setSelectedCharacters([]);
    }
  });

  const addUsersMutation = useMutation({
    mutationFn: async (userEmails) => {
      const promises = userEmails.map(email =>
        base44.entities.GroupChatMember.create({
          group_id: groupId,
          member_type: 'user',
          member_id: email
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      setShowAddUser(false);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, imageUrl }) => {
      await base44.entities.GroupChatMessage.create({
        group_id: groupId,
        sender_type: 'user',
        sender_id: user.email,
        content,
        image_url: imageUrl || null
      });

      queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] });
      setIsTyping(true);

      const recentMessages = messages.slice(-15);
      const history = recentMessages.map(m => {
        if (m.sender_type === 'user') {
          return `Nutzer: ${m.content}${m.image_url ? ' [Bild gesendet]' : ''}`;
        } else {
          const char = characters.find(c => c.id === m.sender_id);
          return `${char?.name || 'Unbekannt'}: ${m.content}${m.image_url ? ' [Bild gesendet]' : ''}`;
        }
      }).join('\n');

      const groupContext = group.theme ? `\n\nGruppen-Thema: ${group.theme}` : '';
      const imageContext = imageUrl ? '\n\n[Der Nutzer hat gerade ein Bild gesendet - Charaktere sollten es kurz erwähnen wenn relevant]' : '';

      const activeCharacters = characterMembers.map(m => 
        characters.find(c => c.id === m.member_id)
      ).filter(Boolean);

      // Build character context with memories
      const characterMemories = {};
      activeCharacters.forEach(char => {
        const charMemories = allMemories.filter(m => m.character_id === char.id);
        if (charMemories.length > 0) {
          characterMemories[char.id] = charMemories;
        }
      });

      const charDescriptions = activeCharacters.map(c => {
        const charMems = characterMemories[c.id] || [];
        const relationMem = charMems.find(m => m.relation_type);
        const memoryText = charMems.length > 0 ? `\n  Was ${c.name} über dich weiß:\n  ${charMems
          .sort((a, b) => {
            const imp = { 'hoch': 3, 'mittel': 2, 'niedrig': 1 };
            return (imp[b.importance_level] || 2) - (imp[a.importance_level] || 2);
          })
          .map(m => `- ${m.memory_text || m.content}${m.importance_level === 'hoch' ? ' (WICHTIG)' : ''}`)
          .join('\n  ')}` : '';
        
        return `${c.name}: ${c.personality}${relationMem ? `\n  Beziehung zu dir: ${relationMem.relation_type}` : ''}${memoryText}`;
      }).join('\n\n');

      const now = new Date();
      const dateTimeContext = `Aktuelles Datum: ${now.toLocaleDateString('de-DE')}, Uhrzeit: ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Du orchestrierst einen Gruppenchat "${group.name}" mit mehreren AI-Charakteren und Nutzern.${groupContext}

Charaktere in der Gruppe:
${charDescriptions}

WICHTIGE REGELN:
- Charaktere sollen authentisch und natürlich agieren
- Sie können sich gegenseitig ansprechen mit @Name
- Nicht alle müssen immer antworten (1-3 Antworten)
- Charaktere können unterschiedliche Meinungen haben
- Sie sollten ihre Persönlichkeit zeigen
- Kurze, natürliche Antworten (wie echte Gruppenchats)
${dateTimeContext}${imageContext}

Bisheriger Chatverlauf (letzte ${recentMessages.length} Nachrichten):
${history}

Neue Nachricht vom Nutzer: ${content}${imageUrl ? ' [Bild gesendet]' : ''}

Wähle 1-3 Charaktere die jetzt reagieren sollten. Sie können:
- Auf den Nutzer antworten
- Aufeinander reagieren
- Eine Diskussion beginnen
- Meinungen austauschen`,
        response_json_schema: {
          type: "object",
          properties: {
            responses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  character_id: { type: "string" },
                  content: { type: "string" }
                }
              }
            }
          }
        }
      });

      setIsTyping(false);

      for (const resp of response.responses || []) {
        // Occasionally add image (5% chance)
        let aiImageUrl = null;
        if (Math.random() < 0.05) {
          try {
            const char = characters.find(c => c.id === resp.character_id);
            const styleHint = char?.writing_style === 'poetisch' ? 'artistic, dreamy' :
                             char?.writing_style === 'mysteriös' ? 'dark, mysterious' :
                             char?.writing_style === 'humorvoll' ? 'fun, casual' : 'natural, authentic';
            
            const imgResponse = await base44.integrations.Core.GenerateImage({
              prompt: `Photo fitting ${char?.name}'s personality: ${char?.personality?.slice(0, 80)}. ${styleHint}. Context: ${resp.content.slice(0, 80)}. Authentic to character.`
            });
            aiImageUrl = imgResponse.url;
          } catch (e) {}
        }

        await base44.entities.GroupChatMessage.create({
          group_id: groupId,
          sender_type: 'character',
          sender_id: resp.character_id,
          content: resp.content,
          image_url: aiImageUrl
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] });
      }
    }
  });

  const handleSend = (content, imageUrl) => {
    if ((!content?.trim() && !imageUrl) || isTyping) return;
    sendMessageMutation.mutate({ content: content || '', imageUrl });
    setMessage('');
  };

  const getMessageSender = (msg) => {
    if (msg.sender_type === 'user') {
      const isCurrentUser = msg.sender_id === user?.email;
      if (isCurrentUser) {
        return { name: 'Du', avatar: null, isCurrentUser: true };
      }
      const sender = allUsers.find(u => u.email === msg.sender_id);
      return {
        name: sender?.display_name || sender?.full_name || sender?.email || 'Nutzer',
        avatar: sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender?.email}`,
        isCurrentUser: false
      };
    }
    const char = characters.find(c => c.id === msg.sender_id);
    return {
      name: char?.name || 'Unbekannt',
      avatar: char?.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char?.name}`,
      isCurrentUser: false
    };
  };

  if (!group) {
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
          <Link to={createPageUrl('GroupChats')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg font-bold">
            {group.name[0]}
          </div>
          
          <div className="flex-1">
            <h2 className="font-semibold">{group.name}</h2>
            <p className="text-xs text-gray-400">
              {userMembers.length} Nutzer, {characterMembers.length} AI
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowAddUser(true)}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <UsersIcon className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowAddMember(true)}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Bot className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => {
            const sender = getMessageSender(msg);
            const isCurrentUser = sender.isCurrentUser;
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isCurrentUser && (
                  <img
                    src={sender.avatar}
                    alt={sender.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className={`max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isCurrentUser && (
                    <span className="text-xs text-gray-400 mb-1 ml-1">{sender.name}</span>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 ${
                    isCurrentUser
                      ? 'bg-emerald-600 text-white rounded-br-md'
                      : 'bg-[#262626] text-gray-100 rounded-bl-md'
                  }`}>
                    {msg.image_url && (
                      <img 
                        src={msg.image_url} 
                        alt="Bild" 
                        className="rounded-lg max-w-full mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.image_url, '_blank')}
                      />
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center"
          >
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
            </div>
            <div className="bg-[#262626] rounded-2xl px-4 py-3">
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

      <div className="p-4 border-t border-white/5 bg-[#1a1a1a]">
        <ChatInput
          onSend={handleSend}
          isLoading={isTyping || sendMessageMutation.isPending}
        />
      </div>

      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>AI-Charaktere hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto py-4">
            {availableCharacters.map((char) => (
              <div
                key={char.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer"
                onClick={() => {
                  setSelectedCharacters(prev =>
                    prev.includes(char.id)
                      ? prev.filter(id => id !== char.id)
                      : [...prev, char.id]
                  );
                }}
              >
                <Checkbox
                  checked={selectedCharacters.includes(char.id)}
                  className="border-white/20"
                />
                <img
                  src={char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`}
                  alt={char.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{char.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-1">{char.personality?.slice(0, 50)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAddMember(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => addMembersMutation.mutate()}
              disabled={selectedCharacters.length === 0 || addMembersMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Hinzufügen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddUserModal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onAdd={(userEmails) => addUsersMutation.mutate(userEmails)}
        groupId={groupId}
      />
    </div>
  );
}