import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';

export default function GroupChats() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['group-chats'],
    queryFn: async () => {
      const allGroups = await base44.entities.GroupChat.list('-created_date');
      const membershipPromises = allGroups.map(g => 
        base44.entities.GroupChatMember.filter({ group_id: g.id })
      );
      const memberships = await Promise.all(membershipPromises);
      
      return allGroups.filter((group, idx) => 
        memberships[idx].some(m => m.member_id === user?.email) || group.admin_email === user?.email
      );
    },
    enabled: !!user
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const group = await base44.entities.GroupChat.create({
        name: groupName,
        description: groupDescription,
        admin_email: user.email
      });
      
      await base44.entities.GroupChatMember.create({
        group_id: group.id,
        member_type: 'user',
        member_id: user.email
      });
      
      return group;
    },
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ['group-chats'] });
      setShowCreateModal(false);
      setGroupName('');
      setGroupDescription('');
      window.location.href = createPageUrl(`GroupChat?groupId=${group.id}`);
    }
  });

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5">
        <div className="flex items-center gap-3 p-4">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Gruppenchats</h1>
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
            <p className="text-gray-400 mb-6">Erstelle deinen ersten Gruppenchat!</p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Gruppe erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <Link key={group.id} to={createPageUrl(`GroupChat?groupId=${group.id}`)}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-gray-400">{group.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <motion.button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Neue Gruppe erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Gruppenname</label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="z.B. KI-Freunde"
                className="bg-[#262626] border-white/10 text-white"
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
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={() => createGroupMutation.mutate()}
              disabled={!groupName.trim() || createGroupMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}