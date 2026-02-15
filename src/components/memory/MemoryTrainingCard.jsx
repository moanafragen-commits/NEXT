import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThumbsUp, ThumbsDown, RefreshCw, Loader2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import MemoryStrengthBar, { calculateDecayedStrength, getStrengthLabel } from './MemoryStrengthBar';
import { MEMORY_TYPES, MEMORY_CATEGORIES } from './EditMemoryModal';

const categoryLabels = Object.fromEntries(MEMORY_CATEGORIES.map(c => [c.value, c.label]));
const typeLabels = Object.fromEntries(MEMORY_TYPES.map(t => [t.value, t.label]));

export default function MemoryTrainingCard({ memory, characterId, onTrained }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [newStrength, setNewStrength] = useState(null);
  const [newImportance, setNewImportance] = useState(null);
  const [trained, setTrained] = useState(false);

  const currentStrength = calculateDecayedStrength(memory);
  const strengthLabel = getStrengthLabel(currentStrength);

  const trainMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.CharacterMemory.update(memory.id, {
        ...data,
        recall_count: (memory.recall_count || 0) + 1,
        last_recalled_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setTrained(true);
      queryClient.invalidateQueries({ queryKey: ['memories', characterId] });
      setTimeout(() => onTrained?.(), 400);
    }
  });

  const handleReinforce = () => {
    trainMutation.mutate({
      strength: 100,
      importance_level: newImportance || memory.importance_level,
    });
  };

  const handleWeaken = () => {
    trainMutation.mutate({
      strength: Math.max(5, currentStrength - 30),
      importance_level: newImportance || memory.importance_level,
    });
  };

  const handleCustomSave = () => {
    trainMutation.mutate({
      strength: newStrength ?? currentStrength,
      importance_level: newImportance || memory.importance_level,
    });
  };

  if (trained) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0.5, scale: 0.98 }}
        className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3"
      >
        <Check className="w-5 h-5 text-emerald-400" />
        <span className="text-sm text-emerald-300">Trainiert ✓</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#262626] rounded-xl border border-white/5 overflow-hidden"
    >
      {/* Main Card */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <Badge variant="outline" className="text-[10px] border-white/20 py-0">
                {typeLabels[memory.memory_type] || memory.memory_type}
              </Badge>
              <Badge variant="outline" className="text-[10px] border-white/20 py-0">
                {categoryLabels[memory.memory_category] || 'Allgemein'}
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
              {memory.recall_count > 0 && (
                <span className="text-[10px] text-gray-500">{memory.recall_count}× erinnert</span>
              )}
            </div>

            {/* Memory text */}
            <p className="text-sm text-gray-200 leading-relaxed">{memory.memory_text}</p>
            
            {/* Strength bar */}
            <div className="mt-3">
              <MemoryStrengthBar memory={memory} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            onClick={handleReinforce}
            disabled={trainMutation.isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-sm h-9"
          >
            {trainMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ThumbsUp className="w-4 h-4 mr-1.5" />
                Verstärken
              </>
            )}
          </Button>
          <Button
            onClick={handleWeaken}
            disabled={trainMutation.isPending}
            variant="outline"
            className="flex-1 border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-sm h-9"
          >
            <ThumbsDown className="w-4 h-4 mr-1.5" />
            Abschwächen
          </Button>
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-white/10 h-9 w-9 flex-shrink-0"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Fine-Tuning */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-white/5 p-4 space-y-4 bg-[#1f1f1f]"
        >
          {/* Strength slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Stärke anpassen</span>
              <span className="text-xs text-emerald-400 font-medium">{newStrength ?? currentStrength}%</span>
            </div>
            <Slider
              value={[newStrength ?? currentStrength]}
              onValueChange={([val]) => setNewStrength(val)}
              min={5}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-emerald-500"
            />
          </div>

          {/* Importance */}
          <div className="space-y-2">
            <span className="text-xs text-gray-400">Wichtigkeit ändern</span>
            <Select
              value={newImportance || memory.importance_level}
              onValueChange={setNewImportance}
            >
              <SelectTrigger className="bg-[#262626] border-white/10 text-white h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-white/10">
                <SelectItem value="hoch" className="text-white">🔴 Hoch – wird stark priorisiert</SelectItem>
                <SelectItem value="mittel" className="text-white">🟡 Mittel – wird manchmal genutzt</SelectItem>
                <SelectItem value="niedrig" className="text-white">🟢 Niedrig – Hintergrundwissen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCustomSave}
            disabled={trainMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-sm h-9"
          >
            {trainMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Anpassung speichern
              </>
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}