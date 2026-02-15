import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const RELATIONSHIP_QUALITIES = [
  { value: 'Freundschaft', emoji: '🤝', color: 'bg-emerald-500/20 text-emerald-300' },
  { value: 'Vertrauen', emoji: '🛡️', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'Misstrauen', emoji: '🤨', color: 'bg-red-500/20 text-red-300' },
  { value: 'Bewunderung', emoji: '⭐', color: 'bg-yellow-500/20 text-yellow-300' },
  { value: 'Rivalität', emoji: '⚔️', color: 'bg-orange-500/20 text-orange-300' },
  { value: 'Respekt', emoji: '🎩', color: 'bg-indigo-500/20 text-indigo-300' },
  { value: 'Zuneigung', emoji: '💕', color: 'bg-pink-500/20 text-pink-300' },
  { value: 'Distanz', emoji: '🧊', color: 'bg-gray-500/20 text-gray-300' },
  { value: 'Neugier', emoji: '🔍', color: 'bg-cyan-500/20 text-cyan-300' }
];

export default function RelationshipPanel({ characterId, userEmail, memories }) {
  const queryClient = useQueryClient();
  
  const relationshipMemory = memories.find(m => m.memory_type === 'relationship' && m.relationship_quality);
  
  const [quality, setQuality] = useState(relationshipMemory?.relationship_quality || 'Freundschaft');
  const [level, setLevel] = useState(relationshipMemory?.relationship_level || 5);
  const [relationType, setRelationType] = useState(relationshipMemory?.relation_type || 'Freund');
  const [hasChanges, setHasChanges] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (relationshipMemory) {
        await base44.entities.CharacterMemory.update(relationshipMemory.id, {
          relationship_quality: quality,
          relationship_level: level,
          relation_type: relationType,
          memory_text: `Beziehung: ${relationType} – ${quality} (Stärke ${level}/10)`,
          last_interaction_date: new Date().toISOString()
        });
      } else {
        await base44.entities.CharacterMemory.create({
          character_id: characterId,
          user_email: userEmail,
          memory_type: 'relationship',
          relationship_quality: quality,
          relationship_level: level,
          relation_type: relationType,
          importance_level: 'hoch',
          memory_text: `Beziehung: ${relationType} – ${quality} (Stärke ${level}/10)`,
          last_interaction_date: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', characterId] });
      setHasChanges(false);
    }
  });

  const currentQualityConfig = RELATIONSHIP_QUALITIES.find(q => q.value === quality);

  const levelLabel = level <= 2 ? 'Sehr schwach' : level <= 4 ? 'Schwach' : level <= 6 ? 'Mittel' : level <= 8 ? 'Stark' : 'Sehr stark';

  return (
    <div className="space-y-5">
      {/* Current Relationship Display */}
      <div className="flex items-center gap-3 p-3 bg-[#262626] rounded-xl">
        <div className="text-3xl">{currentQualityConfig?.emoji || '🤝'}</div>
        <div className="flex-1">
          <p className="font-medium text-white text-sm">{quality}</p>
          <p className="text-xs text-gray-400">{relationType} · {levelLabel}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-emerald-400">{level}</span>
          <span className="text-[10px] text-gray-500">/ 10</span>
        </div>
      </div>

      {/* Relationship Quality Picker */}
      <div>
        <Label className="text-gray-300 text-xs mb-2 block">Beziehungsdynamik</Label>
        <div className="grid grid-cols-3 gap-2">
          {RELATIONSHIP_QUALITIES.map((q) => (
            <button
              key={q.value}
              onClick={() => { setQuality(q.value); setHasChanges(true); }}
              className={`p-2 rounded-lg text-xs font-medium transition-all border ${
                quality === q.value
                  ? `${q.color} border-white/20 ring-1 ring-white/10`
                  : 'bg-[#262626] text-gray-400 border-white/5 hover:border-white/10'
              }`}
            >
              <span className="block text-base mb-0.5">{q.emoji}</span>
              {q.value}
            </button>
          ))}
        </div>
      </div>

      {/* Relationship Type */}
      <div>
        <Label className="text-gray-300 text-xs mb-2 block">Beziehungstyp</Label>
        <Select value={relationType} onValueChange={(v) => { setRelationType(v); setHasChanges(true); }}>
          <SelectTrigger className="bg-[#262626] border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#262626] border-white/10">
            {['Freund', 'Mentor', 'Kollege', 'Familie', 'Partner', 'Bekannter', 'Andere'].map(t => (
              <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Relationship Level */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-gray-300 text-xs">Beziehungsstärke</Label>
          <span className="text-xs text-emerald-400 font-medium">{level}/10 – {levelLabel}</span>
        </div>
        <Slider
          value={[level]}
          onValueChange={([v]) => { setLevel(v); setHasChanges(true); }}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
      </div>

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
              <><Save className="w-4 h-4 mr-2" /> Beziehung speichern</>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}