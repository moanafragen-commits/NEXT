import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function AddUserModal({ open, onClose, onAdd, groupId }) {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: currentUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => base44.entities.GroupChatMember.filter({ group_id: groupId }),
    enabled: !!groupId
  });

  const userMembers = members.filter(m => m.member_type === 'user');
  const availableUsers = allUsers.filter(u => 
    u.email !== currentUser?.email && !userMembers.some(m => m.member_id === u.email)
  );

  const handleAdd = () => {
    onAdd(selectedUsers);
    setSelectedUsers([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Nutzer hinzufügen</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto py-4">
          {availableUsers.map((user) => (
            <div
              key={user.email}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer"
              onClick={() => {
                setSelectedUsers(prev =>
                  prev.includes(user.email)
                    ? prev.filter(email => email !== user.email)
                    : [...prev, user.email]
                );
              }}
            >
              <Checkbox
                checked={selectedUsers.includes(user.email)}
                className="border-white/20"
              />
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.display_name || user.full_name || user.email}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium">{user.display_name || user.full_name || user.email}</h4>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedUsers.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            Hinzufügen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}