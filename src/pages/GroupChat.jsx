import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Bot, Send, Loader2, Users as UsersIcon, Plus, Info, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from 'framer-motion';
import GroupChatBubble from '@/components/groupchat/GroupChatBubble';
import GroupChatMembersSheet from '@/components/groupchat/GroupChatMembersSheet';

export default function GroupChat() {
  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get('groupId');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingCharName, setTypingCharName] = useState('');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

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

  const { data: messages = [] } = useQuery({
    queryKey: ['group-messages', groupId],
    queryFn: () => base44.entities.GroupChatMessage.filter({ group_id: groupId }, 'created_date', 200),
    enabled: !!groupId
  });

  const { data: allMemories = [] } = useQuery({
    queryKey: ['all-memories', user?.email],
    queryFn: () => base44.entities.CharacterMemory.filter({ user_email: user.email }),
    enabled: !!user
  });

  const characterMembers = members.filter(m => m.member_type === 'character');
  const availableCharacters = characters.filter(c =>
    !c.is_archived && !characterMembers.some(m => m.member_id === c.id)
  );

  const activeCharacters = characterMembers.map(m =>
    characters.find(c => c.id === m.member_id)
  ).filter(Boolean);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Mark messages as read
  useEffect(() => {
    if (!user || !messages.length) return;
    const markAsRead = async () => {
      const unread = messages.filter(m => m.sender_id !== user.email);
      const reads = await base44.entities.MessageRead.filter({ user_email: user.email, message_type: 'group' });
      const readIds = new Set(reads.map(r => r.message_id));
      const toMark = unread.filter(m => !readIds.has(m.id));
      for (const msg of toMark) {
        await base44.entities.MessageRead.create({ message_id: msg.id, message_type: 'group', user_email: user.email });
      }
      if (toMark.length > 0) queryClient.invalidateQueries({ queryKey: ['unread-group-messages'] });
    };
    markAsRead();
  }, [messages, user]);

  const addMembersMutation = useMutation({
    mutationFn: async () => {
      for (const charId of selectedCharacters) {
        await base44.entities.GroupChatMember.create({
          group_id: groupId, member_type: 'character', member_id: charId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      setShowAddMember(false);
      setSelectedCharacters([]);
    }
  });

  const generateAIResponses = async (triggerContent, triggerSenderName) => {
    setIsTyping(true);

    const recentMessages = messages.slice(-20);
    const history = recentMessages.map(m => {
      if (m.sender_type === 'user') {
        const isMe = m.sender_id === user?.email;
        return `${isMe ? user?.full_name || 'Nutzer' : 'Nutzer'}: ${m.content}`;
      }
      const char = characters.find(c => c.id === m.sender_id);
      return `${char?.name || 'Unbekannt'}: ${m.content}`;
    }).join('\n');

    const groupContext = group?.theme ? `\nGruppen-Thema: ${group.theme}` : '';
    const now = new Date();
    const dateCtx = `Datum: ${now.toLocaleDateString('de-DE')}, ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;

    const charDescriptions = activeCharacters.map(c => {
      const charMems = allMemories.filter(m => m.character_id === c.id);
      const memoryText = charMems.length > 0
        ? `\n  Erinnerungen: ${charMems.slice(0, 5).map(m => m.memory_text).join('; ')}`
        : '';
      const orientationText = c.sexual_orientation ? ` (Orientierung: ${c.sexual_orientation})` : '';
      const relationshipText = c.initial_relationship ? ` [Beziehung zum Nutzer: ${c.initial_relationship}]` : '';
      return `- ${c.name}: ${c.personality}${c.writing_style ? ` (Stil: ${c.writing_style})` : ''}${orientationText}${relationshipText}${memoryText}`;
    }).join('\n');

    const isNsfwMode = user?.nsfw_mode || false;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Du orchestrierst einen Gruppenchat "${group?.name}" mit KI-Charakteren.${groupContext}
${dateCtx}

Charaktere:
${charDescriptions}

REGELN:
- Wähle 1-3 Charaktere die jetzt reagieren (nicht alle müssen antworten!)
- Charaktere sollen NATÜRLICH und IN CHARACTER antworten
- Sie dürfen aufeinander reagieren, sich gegenseitig ansprechen
- Sie können verschiedene Meinungen haben und diskutieren
- Kurze, natürliche Nachrichten (wie echte Gruppenchats)
- Charaktere können Emojis nutzen passend zu ihrer Persönlichkeit
- Manche Charaktere können auch gar nicht antworten wenn es nicht zu ihnen passt

Außerdem: Extrahiere wichtige neue Informationen aus der Konversation, die sich die Charaktere merken sollten (z.B. Fakten über den Nutzer, Meinungen anderer Charaktere, gemeinsame Erlebnisse im Chat). Gib für JEDEN Charakter in der Gruppe relevante Erinnerungen zurück.

Chatverlauf:
${history}

Neue Nachricht von ${triggerSenderName}: ${triggerContent}

Antworte als JSON mit den Antworten der reagierenden Charaktere. Jede Antwort muss die exakte character_id haben.
Verfügbare character_ids: ${activeCharacters.map(c => `${c.name}=${c.id}`).join(', ')}`,
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
          },
          new_memories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                character_id: { type: "string", description: "Für welchen Charakter ist diese Erinnerung" },
                memory_text: { type: "string", description: "Was soll sich der Charakter merken" },
                importance: { type: "number", description: "Wichtigkeit 1-10" },
                memory_type: { type: "string", enum: ["fact", "preference", "event", "emotion", "relationship", "opinion"] }
              }
            }
          }
        }
      }
    });

    setIsTyping(false);

    // Send responses with typing delays
    for (const resp of response.responses || []) {
      const char = characters.find(c => c.id === resp.character_id);
      if (!char || !resp.content) continue;

      setTypingCharName(char.name);
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 2000));
      setIsTyping(false);

      await base44.entities.GroupChatMessage.create({
        group_id: groupId,
        sender_type: 'character',
        sender_id: resp.character_id,
        content: resp.content
      });
      queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] });

      // Small pause between messages
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Save new memories from group chat for each character
    if (response.new_memories?.length > 0 && user) {
      for (const mem of response.new_memories) {
        if (!mem.memory_text || !mem.character_id || mem.importance < 3) continue;
        const existingMems = allMemories.filter(m => m.character_id === mem.character_id);
        const isDuplicate = existingMems.some(m => 
          m.memory_text?.toLowerCase().includes(mem.memory_text.toLowerCase().slice(0, 25))
        );
        if (!isDuplicate) {
          await base44.entities.CharacterMemory.create({
            character_id: mem.character_id,
            user_email: user.email,
            memory_text: `[Gruppenchat "${group?.name}"] ${mem.memory_text}`,
            memory_type: mem.memory_type || 'event',
            memory_category: 'shared_experiences',
            importance_level: mem.importance >= 7 ? 'hoch' : mem.importance >= 4 ? 'mittel' : 'niedrig',
            strength: Math.min(100, mem.importance * 10),
            source: 'ai_extracted'
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['all-memories'] });
    }

    // 30% chance for characters to continue talking to each other
    if (Math.random() < 0.3 && activeCharacters.length >= 2 && (response.responses?.length || 0) >= 2) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedMessages = await base44.entities.GroupChatMessage.filter({ group_id: groupId }, 'created_date', 200);
      const updatedHistory = updatedMessages.slice(-20).map(m => {
        if (m.sender_type === 'user') return `Nutzer: ${m.content}`;
        const char = characters.find(c => c.id === m.sender_id);
        return `${char?.name || '?'}: ${m.content}`;
      }).join('\n');

      const followUp = await base44.integrations.Core.InvokeLLM({
        prompt: `Gruppenchat "${group?.name}". Charaktere reden MITEINANDER weiter (nicht zum Nutzer).
${charDescriptions}

Chatverlauf:
${updatedHistory}

Wähle 1-2 Charaktere die jetzt aufeinander reagieren. Sie sollen sich gegenseitig ansprechen oder auf das Gesagte eingehen. Kurz und natürlich.
character_ids: ${activeCharacters.map(c => `${c.name}=${c.id}`).join(', ')}`,
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

      for (const resp of followUp.responses || []) {
        const char = characters.find(c => c.id === resp.character_id);
        if (!char || !resp.content) continue;
        setTypingCharName(char.name);
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
        setIsTyping(false);

        await base44.entities.GroupChatMessage.create({
          group_id: groupId, sender_type: 'character', sender_id: resp.character_id, content: resp.content
        });
        queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] });
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }
    setTypingCharName('');
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.GroupChatMessage.create({
        group_id: groupId, sender_type: 'user', sender_id: user.email, content
      });
      queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] });

      await generateAIResponses(content, user?.full_name || 'Nutzer');
    }
  });

  const handleSend = () => {
    if (!messageText.trim() || isTyping || sendMessageMutation.isPending) return;
    const text = messageText;
    setMessageText('');
    sendMessageMutation.mutate(text);
  };

  const getMessageSender = (msg) => {
    if (msg.sender_type === 'user') {
      const isCurrentUser = msg.sender_id === user?.email;
      return { name: isCurrentUser ? 'Du' : 'Nutzer', avatar: null, isCurrentUser };
    }
    const char = characters.find(c => c.id === msg.sender_id);
    return {
      name: char?.name || 'Unbekannt',
      avatar: char?.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${msg.sender_id}`,
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
    <div className="h-screen bg-[#111] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5">
        <div className="flex items-center gap-3 p-3">
          <Link to={createPageUrl('GroupChats')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          {/* Stacked avatars */}
          <div className="relative w-10 h-10 flex-shrink-0" onClick={() => setShowMembers(true)}>
            {activeCharacters.length === 0 ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg font-bold">
                {group.name[0]}
              </div>
            ) : activeCharacters.length === 1 ? (
              <img src={activeCharacters[0].avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${activeCharacters[0].name}`} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <>
                <img src={activeCharacters[0]?.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${activeCharacters[0]?.name}`} className="w-7 h-7 rounded-full object-cover absolute top-0 left-0 border-2 border-[#1a1a1a]" alt="" />
                <img src={activeCharacters[1]?.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${activeCharacters[1]?.name}`} className="w-7 h-7 rounded-full object-cover absolute bottom-0 right-0 border-2 border-[#1a1a1a]" alt="" />
              </>
            )}
          </div>

          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowMembers(true)}>
            <h2 className="font-semibold truncate">{group.name}</h2>
            <p className="text-xs text-gray-400 truncate">
              {activeCharacters.map(c => c.name).join(', ')}
            </p>
          </div>

          <Button
            variant="ghost" size="icon"
            onClick={() => setShowAddMember(true)}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <UsersIcon className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-gray-400 text-sm">Schreib die erste Nachricht und die Charaktere werden antworten!</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => {
            const sender = getMessageSender(msg);
            return (
              <GroupChatBubble key={msg.id} message={msg} sender={sender} />
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
            </div>
            <div className="bg-[#262626] rounded-2xl px-4 py-2.5 rounded-bl-md">
              <p className="text-xs text-gray-400 mb-1">{typingCharName || 'KI'}</p>
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
      <div className="shrink-0 p-3 border-t border-white/5 bg-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Nachricht schreiben..."
            className="flex-1 bg-[#262626] text-white rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-500 text-sm"
            disabled={isTyping || sendMessageMutation.isPending}
          />
          {messageText.trim() && (
            <Button
              onClick={handleSend}
              disabled={isTyping || sendMessageMutation.isPending}
              size="icon"
              className="h-11 w-11 rounded-full bg-emerald-600 hover:bg-emerald-500 flex-shrink-0"
            >
              {sendMessageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Add Characters Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Charaktere hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto py-2">
            {availableCharacters.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Alle Charaktere sind bereits in der Gruppe.</p>
            ) : (
              availableCharacters.map((char) => (
                <div
                  key={char.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCharacters.includes(char.id) ? 'bg-emerald-600/20 border border-emerald-500/30' : 'hover:bg-white/5 border border-transparent'
                  }`}
                  onClick={() => {
                    setSelectedCharacters(prev =>
                      prev.includes(char.id) ? prev.filter(id => id !== char.id) : [...prev, char.id]
                    );
                  }}
                >
                  <img
                    src={char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`}
                    className="w-10 h-10 rounded-full object-cover"
                    alt={char.name}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{char.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{char.personality?.slice(0, 50)}</p>
                  </div>
                  <Checkbox checked={selectedCharacters.includes(char.id)} className="border-white/20" />
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowAddMember(false)}>Abbrechen</Button>
            <Button
              onClick={() => addMembersMutation.mutate()}
              disabled={selectedCharacters.length === 0 || addMembersMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Hinzufügen ({selectedCharacters.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Members Sheet */}
      <GroupChatMembersSheet
        open={showMembers}
        onClose={() => setShowMembers(false)}
        characters={activeCharacters}
        groupName={group.name}
      />
    </div>
  );
}