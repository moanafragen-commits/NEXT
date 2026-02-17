import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareNewsSheet({ open, onClose, article }) {
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: groupChats = [] } = useQuery({
    queryKey: ['user-group-chats'],
    queryFn: () => base44.entities.GroupChat.list('-created_date', 20),
    enabled: open
  });

  const { data: groupMembers = [] } = useQuery({
    queryKey: ['all-group-members'],
    queryFn: () => base44.entities.GroupChatMember.list('-created_date', 200),
    enabled: open
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date', 50),
    enabled: open
  });

  const shareMutation = useMutation({
    mutationFn: async (groupId) => {
      await base44.entities.GroupChatMessage.create({
        group_id: groupId,
        sender_type: 'user',
        sender_id: user.email,
        content: `📰 *News geteilt:*\n\n**${article.headline}**\n${article.content}`,
        is_shared_message: true,
        shared_original_content: article.content
      });
      queryClient.invalidateQueries({ queryKey: ['group-messages'] });
    },
    onSuccess: () => {
      toast.success('News in Gruppe geteilt!');
      onClose();
      setSelectedGroupId(null);
    }
  });

  const getGroupAvatars = (groupId) => {
    const members = groupMembers.filter(m => m.group_id === groupId && m.member_type === 'character');
    return members.slice(0, 3).map(m => {
      const char = characters.find(c => c.id === m.member_id);
      return char?.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${m.member_id}`;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="bg-[#1a1a1a] border-white/10 rounded-t-2xl max-h-[60vh]">
        <SheetHeader>
          <SheetTitle className="text-white">News in Gruppenchat teilen</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-2 overflow-y-auto max-h-[40vh]">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
            <p className="text-[10px] text-gray-500 uppercase mb-1">📰 Artikel</p>
            <p className="text-sm font-semibold text-white">{article?.headline}</p>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{article?.content}</p>
          </div>

          {groupChats.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Noch keine Gruppenchats vorhanden</p>
            </div>
          ) : (
            groupChats.map(group => {
              const avatars = getGroupAvatars(group.id);
              const memberCount = groupMembers.filter(m => m.group_id === group.id).length;
              const isSelected = selectedGroupId === group.id;

              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(isSelected ? null : group.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isSelected ? 'bg-emerald-600/20 border border-emerald-500/30' : 'bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="relative w-10 h-10 flex-shrink-0">
                    {avatars.length >= 2 ? (
                      <>
                        <img src={avatars[0]} className="w-7 h-7 rounded-full object-cover absolute top-0 left-0 border-2 border-[#1a1a1a]" alt="" />
                        <img src={avatars[1]} className="w-7 h-7 rounded-full object-cover absolute bottom-0 right-0 border-2 border-[#1a1a1a]" alt="" />
                      </>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        {group.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-sm font-medium text-white truncate">{group.name}</h4>
                    <p className="text-xs text-gray-500">{memberCount} Mitglieder</p>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        {selectedGroupId && (
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <Button
              onClick={() => shareMutation.mutate(selectedGroupId)}
              disabled={shareMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              {shareMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Teilen
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}