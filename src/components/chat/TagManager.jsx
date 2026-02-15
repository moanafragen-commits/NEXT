import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const TAG_COLORS = [
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'bg-red-500/20 text-red-400 border-red-500/30',
  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
];

function getTagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export { getTagColor };

export default function TagManager({ character, compact = false }) {
  const [newTag, setNewTag] = useState('');
  const [showInput, setShowInput] = useState(false);
  const queryClient = useQueryClient();

  const updateTagsMutation = useMutation({
    mutationFn: (tags) => base44.entities.Character.update(character.id, { tags }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] })
  });

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (!tag || (character.tags || []).includes(tag)) return;
    updateTagsMutation.mutate([...(character.tags || []), tag]);
    setNewTag('');
    setShowInput(false);
  };

  const removeTag = (tagToRemove) => {
    updateTagsMutation.mutate((character.tags || []).filter(t => t !== tagToRemove));
  };

  const tags = character.tags || [];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {tags.map(tag => (
        <Badge
          key={tag}
          className={`text-[10px] px-1.5 py-0 border ${getTagColor(tag)} cursor-default`}
        >
          {tag}
          {!compact && (
            <button onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="ml-1 hover:opacity-70">
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </Badge>
      ))}
      {!compact && (
        showInput ? (
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') setShowInput(false); }}
              placeholder="Tag..."
              className="h-6 w-20 text-xs bg-[#262626] border-white/10 text-white px-2"
              autoFocus
            />
            <button onClick={addTag} className="text-emerald-400 hover:text-emerald-300">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowInput(true); }}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
          </button>
        )
      )}
    </div>
  );
}