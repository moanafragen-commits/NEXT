import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Users, MessageCircle, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareNewsSheet({ open, onClose, article }) {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'group' or 'character'
  const [tab, setTab] = useState('chats'); // 'chats' or 'groups'
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

  const activeChars = characters.filter(c => !c.is_archived && !c.is_blocked);

  const shareToGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      await base44.entities.GroupChatMessage.create({
        group_id: groupId,
        sender_type: 'user',
        sender_id: user.email,
        content: `📰 *${article.source_name || 'News'}*\n\n**${article.headline}**\n${article.content}`,
        is_shared_message: true,
        shared_original_content: article.content
      });
      queryClient.invalidateQueries({ queryKey: ['group-messages'] });
    },
    onSuccess: () => {
      toast.success('News in Gruppe geteilt!');
      onClose();
      setSelectedId(null);
      setSelectedType(null);
    }
  });

  const shareToChatMutation = useMutation({
    mutationFn: async (characterId) => {
      await base44.entities.ChatMessage.create({
        character_id: characterId,
        role: 'user',
        content: `📰 *${article.source_name || 'News'}:*\n\n**${article.headline}**\n\n${article.content}\n\nWas sagst du dazu?`,
        status: 'sent'
      });
      queryClient.invalidateQueries({ queryKey: ['messages', characterId] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    },
    onSuccess: () => {
      toast.success('News im Chat geteilt!');
      onClose();
      setSelectedId(null);
      setSelectedType(null);
    }
  });

  const handleShare = () => {
    if (selectedType === 'group') shareToGroupMutation.mutate(selectedId);
    else if (selectedType === 'character') shareToChatMutation.mutate(selectedId);
  };

  const isPending = shareToGroupMutation.isPending || shareToChatMutation.isPending;

  const getGroupAvatars = (groupId) => {
    const members = groupMembers.filter(m => m.group_id === groupId && m.member_type === 'character');
    return members.slice(0, 3).map(m => {
      const char = characters.find(c => c.id === m.member_id);
      return char?.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${m.member_id}`;
    });
  };

  const isVerifiedChar = (char) => char.is_verified || ['Berühmtheit', 'Influencer', 'Sportler', 'Musiker', 'Politiker', 'Wissenschaftler', 'Künstler', 'Unternehmer'].includes(char.category);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="bg-[#1a1a1a] border-white/10 rounded-t-2xl max-h-[70vh]">
        <SheetHeader>
          <SheetTitle className="text-white">News teilen</SheetTitle>
        </SheetHeader>

        {/* Article preview */}
        <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">{article?.source_logo_emoji || article?.emoji || '📰'}</span>
            <span className="text-xs font-bold text-white">{article?.source_name || 'News'}</span>
            {article?.source_verified !== false && <BadgeCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
          </div>
          <p className="text-sm font-semibold text-white">{article?.headline}</p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{article?.content}</p>
        </div>

        {/* Tabs */}
        <div className="flex mt-4 mb-3 gap-1 p-1 bg-white/[0.03] rounded-xl">
          <button
            onClick={() => { setTab('chats'); setSelectedId(null); setSelectedType(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'chats' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <MessageCircle className="w-4 h-4" /> Einzelchat
          </button>
          <button
            onClick={() => { setTab('groups'); setSelectedId(null); setSelectedType(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'groups' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Users className="w-4 h-4" /> Gruppenchat
          </button>
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-[30vh]">
          {tab === 'chats' ? (
            activeChars.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Noch keine Chats vorhanden</p>
              </div>
            ) : (
              activeChars.map(char => {
                const isSelected = selectedId === char.id && selectedType === 'character';
                return (
                  <button
                    key={char.id}
                    onClick={() => { setSelectedId(isSelected ? null : char.id); setSelectedType(isSelected ? null : 'character'); }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                      isSelected ? 'bg-emerald-600/20 border border-emerald-500/30' : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05]'
                    }`}
                  >
                    <img src={char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`} className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10" alt="" />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-white truncate">{char.name}</span>
                        {isVerifiedChar(char) && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{char.status || char.category || ''}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                  </button>
                );
              })
            )
          ) : (
            groupChats.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Noch keine Gruppenchats vorhanden</p>
              </div>
            ) : (
              groupChats.map(group => {
                const avatars = getGroupAvatars(group.id);
                const memberCount = groupMembers.filter(m => m.group_id === group.id).length;
                const isSelected = selectedId === group.id && selectedType === 'group';
                return (
                  <button
                    key={group.id}
                    onClick={() => { setSelectedId(isSelected ? null : group.id); setSelectedType(isSelected ? null : 'group'); }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                      isSelected ? 'bg-emerald-600/20 border border-emerald-500/30' : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="relative w-9 h-9 flex-shrink-0">
                      {avatars.length >= 2 ? (
                        <>
                          <img src={avatars[0]} className="w-6 h-6 rounded-full object-cover absolute top-0 left-0 border-2 border-[#1a1a1a]" alt="" />
                          <img src={avatars[1]} className="w-6 h-6 rounded-full object-cover absolute bottom-0 right-0 border-2 border-[#1a1a1a]" alt="" />
                        </>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                          {group.name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-sm font-medium text-white truncate">{group.name}</h4>
                      <p className="text-[11px] text-gray-500">{memberCount} Mitglieder</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                  </button>
                );
              })
            )
          )}
        </div>

        {selectedId && (
          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <Button
              onClick={handleShare}
              disabled={isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Teilen
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}