import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import MemoryStrengthBar, { calculateDecayedStrength, getStrengthLabel } from './MemoryStrengthBar';
import { MEMORY_TYPES, MEMORY_CATEGORIES } from './EditMemoryModal';

const categoryLabels = Object.fromEntries(MEMORY_CATEGORIES.map(c => [c.value, c.label]));
const typeLabels = Object.fromEntries(MEMORY_TYPES.map(t => [t.value, t.label]));

export default function MemoryList({ memories, characterId, onEdit }) {
  const queryClient = useQueryClient();
  const [refreshingId, setRefreshingId] = useState(null);

  const deleteMemoryMutation = useMutation({
    mutationFn: (memoryId) => base44.entities.CharacterMemory.delete(memoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', characterId] });
    }
  });

  const refreshMemoryMutation = useMutation({
    mutationFn: async (memory) => {
      setRefreshingId(memory.id);
      await base44.entities.CharacterMemory.update(memory.id, {
        strength: 100,
        recall_count: (memory.recall_count || 0) + 1,
        last_recalled_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setRefreshingId(null);
      queryClient.invalidateQueries({ queryKey: ['memories', characterId] });
    },
    onError: () => setRefreshingId(null)
  });

  // Group memories by category
  const grouped = memories.reduce((acc, m) => {
    const cat = m.memory_category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  // Sort categories
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    if (a === 'general') return 1;
    if (b === 'general') return -1;
    return (categoryLabels[a] || a).localeCompare(categoryLabels[b] || b);
  });

  // Count weak memories
  const weakMemories = memories.filter(m => calculateDecayedStrength(m) < 30);

  return (
    <div className="space-y-4">
      {weakMemories.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <p className="text-xs text-orange-400">
            ⚠️ {weakMemories.length} Erinnerung{weakMemories.length > 1 ? 'en verblassen' : ' verblasst'}. Auffrischen um sie zu stärken!
          </p>
        </div>
      )}

      {sortedCategories.map(cat => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {categoryLabels[cat] || cat}
            </span>
            <span className="text-[10px] text-gray-600">({grouped[cat].length})</span>
          </div>
          <div className="space-y-2">
            {grouped[cat]
              .sort((a, b) => {
                const order = { hoch: 3, mittel: 2, niedrig: 1 };
                return (order[b.importance_level] || 2) - (order[a.importance_level] || 2);
              })
              .map(memory => {
                const strength = calculateDecayedStrength(memory);
                const isWeak = strength < 30;
                
                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-[#262626] rounded-lg p-3 ${isWeak ? 'border border-orange-500/20' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <Badge variant="outline" className="text-[10px] border-white/20 py-0">
                            {typeLabels[memory.memory_type] || memory.memory_type}
                          </Badge>
                          <Badge 
                            className={`text-[10px] py-0 ${
                              memory.importance_level === 'hoch' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                              memory.importance_level === 'mittel' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              'bg-gray-500/20 text-gray-300 border-gray-500/30'
                            }`}
                          >
                            {memory.importance_level}
                          </Badge>
                          {memory.source === 'ai_extracted' && (
                            <Badge className="text-[10px] py-0 bg-purple-500/20 text-purple-300 border-purple-500/30">
                              🤖 KI
                            </Badge>
                          )}
                          {memory.recall_count > 0 && (
                            <span className="text-[10px] text-gray-500">
                              {memory.recall_count}× erinnert
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{memory.memory_text}</p>
                        <div className="mt-2">
                          <MemoryStrengthBar memory={memory} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {isWeak && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => refreshMemoryMutation.mutate(memory)}
                            disabled={refreshingId === memory.id}
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 h-7 w-7"
                            title="Auffrischen"
                          >
                            {refreshingId === memory.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(memory)}
                          className="text-gray-400 hover:text-white hover:bg-white/10 h-7 w-7"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMemoryMutation.mutate(memory.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}