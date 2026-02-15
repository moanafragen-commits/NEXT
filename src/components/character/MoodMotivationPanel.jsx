import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Save, Loader2, Target } from 'lucide-react';
import MoodBadge, { MOOD_CONFIG } from './MoodBadge';
import { motion } from 'framer-motion';

const MOODS = Object.keys(MOOD_CONFIG);

export default function MoodMotivationPanel({ character }) {
  const queryClient = useQueryClient();
  const [selectedMood, setSelectedMood] = useState(character.current_mood || '');
  const [motivation, setMotivation] = useState(character.current_motivation || '');
  const [progress, setProgress] = useState(character.motivation_progress || 0);
  const [hasChanges, setHasChanges] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Character.update(character.id, {
        current_mood: selectedMood || null,
        current_motivation: motivation || null,
        motivation_progress: progress
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', character.id] });
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      setHasChanges(false);
    }
  });

  return (
    <div className="space-y-5">
      {/* Current State */}
      {(character.current_mood || character.current_motivation) && (
        <div className="p-3 bg-[#262626] rounded-xl space-y-2">
          {character.current_mood && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Stimmung:</span>
              <MoodBadge mood={character.current_mood} />
            </div>
          )}
          {character.current_motivation && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-gray-400">Ziel:</span>
                <span className="text-xs text-white">{character.current_motivation}</span>
              </div>
              <Progress value={character.motivation_progress || 0} className="h-1.5" />
              <span className="text-[10px] text-gray-500">{character.motivation_progress || 0}% erreicht</span>
            </div>
          )}
        </div>
      )}

      {/* Mood Selector */}
      <div>
        <Label className="text-gray-300 text-xs mb-2 block">Stimmung setzen</Label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood) => {
            const config = MOOD_CONFIG[mood];
            return (
              <button
                key={mood}
                onClick={() => { setSelectedMood(mood); setHasChanges(true); }}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                  selectedMood === mood
                    ? `${config.color} border-white/20 ring-1 ring-white/10`
                    : 'bg-[#262626] text-gray-400 border-white/5 hover:border-white/10'
                }`}
              >
                {config.emoji} {mood}
              </button>
            );
          })}
        </div>
      </div>

      {/* Motivation */}
      <div>
        <Label className="text-gray-300 text-xs mb-2 block">Aktuelles Ziel / Motivation</Label>
        <Input
          value={motivation}
          onChange={(e) => { setMotivation(e.target.value); setHasChanges(true); }}
          placeholder="z.B. Will den Nutzer zum Lachen bringen..."
          className="bg-[#262626] border-white/10 text-white text-sm"
        />
        <p className="text-[10px] text-gray-500 mt-1">Der Charakter wird dieses Ziel subtil im Gespräch verfolgen</p>
      </div>

      {/* Progress */}
      {motivation && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-gray-300 text-xs">Zielfortschritt</Label>
            <span className="text-xs text-emerald-400">{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => { setProgress(Number(e.target.value)); setHasChanges(true); }}
            className="w-full accent-emerald-500"
          />
        </div>
      )}

      {/* Save */}
      {hasChanges && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Speichern...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Änderungen speichern</>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}