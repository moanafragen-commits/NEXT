import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Users, ArrowLeft, Loader2, Check, Trash2, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import BottomNav from '@/components/navigation/BottomNav';

export default function GroupChats() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1); // 1=name, 2=select characters
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState([]);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['group-chats'],
    queryFn: async () => {
      const allGroups = await base44.entities.GroupChat.list('-created_date');
      const membershipPromises = allGroups.map(g => 
        base44.entities.GroupChatMember.filter({ group_id: g.id })
      );
      const memberships = await Promise.all(membershipPromises);
      
      return allGroups
        .filter((group, idx) => 
          memberships[idx].some(m => m.member_id === user?.email) || group.admin_email === user?.email
        )
        .map((group, idx) => ({
          ...group,
          members: memberships[idx]
        }));
    },
    enabled: !!user
  });

  const { data: lastMessages } = useQuery({
    queryKey: ['group-last-messages'],
    queryFn: async () => {
      const map = {};
      for (const g of groups) {
        const msgs = await base44.entities.GroupChatMessage.filter({ group_id: g.id }, '-created_date', 1);
        if (msgs.length > 0) map[g.id] = msgs[0];
      }
      return map;
    },
    enabled: groups.length > 0
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const group = await base44.entities.GroupChat.create({
        name: groupName,
        description: groupDescription,
        admin_email: user.email
      });
      
      // Add user as member
      await base44.entities.GroupChatMember.create({
        group_id: group.id,
        member_type: 'user',
        member_id: user.email
      });

      // Add selected characters as members
      for (const charId of selectedCharacterIds) {
        await base44.entities.GroupChatMember.create({
          group_id: group.id,
          member_type: 'character',
          member_id: charId
        });
      }
      
      return group;
    },
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ['group-chats'] });
      resetCreateModal();
      window.location.href = createPageUrl(`GroupChat?groupId=${group.id}`);
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      const msgs = await base44.entities.GroupChatMessage.filter({ group_id: groupId });
      await Promise.all(msgs.map(m => base44.entities.GroupChatMessage.delete(m.id)));
      const members = await base44.entities.GroupChatMember.filter({ group_id: groupId });
      await Promise.all(members.map(m => base44.entities.GroupChatMember.delete(m.id)));
      await base44.entities.GroupChat.delete(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-chats'] });
    }
  });

  const resetCreateModal = () => {
    setShowCreateModal(false);
    setCreateStep(1);
    setGroupName('');
    setGroupDescription('');
    setSelectedCharacterIds([]);
  };

  const toggleCharacter = (charId) => {
    setSelectedCharacterIds(prev =>
      prev.includes(charId) ? prev.filter(id => id !== charId) : [...prev, charId]
    );
  };

  const getGroupAvatars = (group) => {
    const charMembers = (group.members || []).filter(m => m.member_type === 'character');
    return charMembers.slice(0, 3).map(m => {
      const char = characters.find(c => c.id === m.member_id);
      return char?.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${m.member_id}`;
    });
  };

  return (
    <div className="min-h-screen bg-[#111] text-white pb-20">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5">
        <div className="flex items-center gap-3 p-4">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Gruppenchats</h1>
          <div className="flex-1" />
          <Button 
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            <Plus className="w-4 h-4 mr-1" />
            Neue Gruppe
          </Button>
        </div>
      </header>

      <main className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Keine Gruppen</h2>
            <p className="text-gray-400 mb-6">Erstelle deinen ersten Gruppenchat mit mehreren KI-Charakteren!</p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Gruppe erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {groups.map((group) => {
                const avatars = getGroupAvatars(group);
                const charCount = (group.members || []).filter(m => m.member_type === 'character').length;
                const lastMsg = lastMessages?.[group.id];
                const lastMsgSender = lastMsg?.sender_type === 'character'
                  ? characters.find(c => c.id === lastMsg.sender_id)?.name
                  : lastMsg?.sender_id === user?.email ? 'Du' : 'Nutzer';

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Link to={createPageUrl(`GroupChat?groupId=${group.id}`)}>
                      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer active:scale-[0.99]">
                        <div className="flex items-center gap-3">
                          {/* Stacked avatars */}
                          <div className="relative w-12 h-12 flex-shrink-0">
                            {avatars.length === 0 ? (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                              </div>
                            ) : avatars.length === 1 ? (
                              <img src={avatars[0]} className="w-12 h-12 rounded-full object-cover" alt="" />
                            ) : (
                              <>
                                <img src={avatars[0]} className="w-8 h-8 rounded-full object-cover absolute top-0 left-0 border-2 border-[#1a1a1a]" alt="" />
                                <img src={avatars[1]} className="w-8 h-8 rounded-full object-cover absolute bottom-0 right-0 border-2 border-[#1a1a1a]" alt="" />
                                {avatars[2] && (
                                  <img src={avatars[2]} className="w-6 h-6 rounded-full object-cover absolute top-0 right-0 border-2 border-[#1a1a1a]" alt="" />
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold truncate">{group.name}</h3>
                              {lastMsg && (
                                <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                                  {formatDistanceToNow(new Date(lastMsg.created_date), { addSuffix: true, locale: de })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-0.5">{charCount} Charakter{charCount !== 1 ? 'e' : ''}</p>
                            {lastMsg && (
                              <p className="text-sm text-gray-400 truncate">
                                <span className="text-gray-500">{lastMsgSender}: </span>
                                {lastMsg.content}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (confirm('Gruppenchat löschen?')) deleteGroupMutation.mutate(group.id);
                            }}
                            className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => { if (!open) resetCreateModal(); }}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {createStep === 1 ? 'Neue Gruppe erstellen' : 'Charaktere auswählen'}
            </DialogTitle>
          </DialogHeader>

          {createStep === 1 ? (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Gruppenname *</label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="z.B. KI-Freunde"
                  className="bg-[#262626] border-white/10 text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Beschreibung (optional)</label>
                <Input
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Worum geht es?"
                  className="bg-[#262626] border-white/10 text-white"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={resetCreateModal}>Abbrechen</Button>
                <Button
                  onClick={() => setCreateStep(2)}
                  disabled={!groupName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  Weiter
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-2">
              <p className="text-sm text-gray-400 mb-3">
                Wähle mindestens 2 Charaktere für den Gruppenchat ({selectedCharacterIds.length} ausgewählt)
              </p>
              <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                {characters.filter(c => !c.is_archived).map((char) => {
                  const isSelected = selectedCharacterIds.includes(char.id);
                  return (
                    <div
                      key={char.id}
                      onClick={() => toggleCharacter(char.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-600/20 border border-emerald-500/30' : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <img
                        src={char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`}
                        alt={char.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{char.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{char.personality?.slice(0, 60)}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <DialogFooter className="mt-4">
                <Button variant="ghost" onClick={() => setCreateStep(1)}>Zurück</Button>
                <Button
                  onClick={() => createGroupMutation.mutate()}
                  disabled={selectedCharacterIds.length < 2 || createGroupMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  {createGroupMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Gruppe erstellen ({selectedCharacterIds.length})
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav user={user} />
    </div>
  );
}