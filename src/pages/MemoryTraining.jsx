import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Brain, Dumbbell, AlertTriangle, Sparkles, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from 'framer-motion';
import MemoryTrainingCard from '@/components/memory/MemoryTrainingCard';
import { calculateDecayedStrength } from '@/components/memory/MemoryStrengthBar';

export default function MemoryTraining() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const [filter, setFilter] = useState('all'); // all, weak, strong, high
  const [trainedCount, setTrainedCount] = useState(0);

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: memories = [] } = useQuery({
    queryKey: ['memories', characterId],
    queryFn: () => base44.entities.CharacterMemory.filter({ character_id: characterId }),
    enabled: !!characterId
  });

  // Calculate stats
  const memoriesWithStrength = memories.map(m => ({
    ...m,
    currentStrength: calculateDecayedStrength(m)
  }));

  const weakMemories = memoriesWithStrength.filter(m => m.currentStrength < 30);
  const fadingMemories = memoriesWithStrength.filter(m => m.currentStrength >= 30 && m.currentStrength < 60);
  const strongMemories = memoriesWithStrength.filter(m => m.currentStrength >= 60);
  const avgStrength = memories.length > 0
    ? Math.round(memoriesWithStrength.reduce((sum, m) => sum + m.currentStrength, 0) / memories.length)
    : 0;

  // Filter memories
  const filteredMemories = memoriesWithStrength
    .filter(m => {
      if (filter === 'weak') return m.currentStrength < 30;
      if (filter === 'fading') return m.currentStrength >= 30 && m.currentStrength < 60;
      if (filter === 'strong') return m.currentStrength >= 60;
      if (filter === 'high') return m.importance_level === 'hoch';
      return true;
    })
    .sort((a, b) => a.currentStrength - b.currentStrength);

  if (!character) return null;

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl(`CharacterInfo?characterId=${characterId}`)}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <img
              src={character.avatar_url || defaultAvatar}
              alt={character.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h1 className="text-sm font-semibold">Erinnerungs-Training</h1>
              <p className="text-xs text-gray-500">{character.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-5 pb-20">
        {/* Stats Overview */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-emerald-300">Trainings-Übersicht</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-black/20 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-emerald-400">{memories.length}</div>
              <div className="text-[10px] text-gray-400">Gesamt</div>
            </div>
            <div className="bg-black/20 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-emerald-400">{avgStrength}%</div>
              <div className="text-[10px] text-gray-400">Ø Stärke</div>
            </div>
            <div className="bg-black/20 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-orange-400">{weakMemories.length}</div>
              <div className="text-[10px] text-gray-400">Schwach</div>
            </div>
          </div>

          {/* Overall health bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Gedächtnis-Gesundheit</span>
              <span className="text-emerald-400">{avgStrength}%</span>
            </div>
            <Progress value={avgStrength} className="h-2 bg-white/10 [&>div]:bg-emerald-500" />
          </div>

          {trainedCount > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              {trainedCount} Erinnerung{trainedCount > 1 ? 'en' : ''} trainiert in dieser Sitzung
            </div>
          )}
        </div>

        {/* Warning for weak memories */}
        {weakMemories.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-orange-300 font-medium">
                {weakMemories.length} Erinnerung{weakMemories.length > 1 ? 'en verblassen' : ' verblasst'}!
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Verstärke sie, damit {character.name} sich besser erinnern kann.
              </p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {[
            { key: 'all', label: 'Alle', count: memories.length },
            { key: 'weak', label: '⚠️ Schwach', count: weakMemories.length },
            { key: 'fading', label: '🌅 Verblassend', count: fadingMemories.length },
            { key: 'strong', label: '💪 Stark', count: strongMemories.length },
            { key: 'high', label: '🔴 Wichtig', count: memoriesWithStrength.filter(m => m.importance_level === 'hoch').length },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filter === f.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#262626] text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
              <span className={`text-[10px] ${filter === f.key ? 'text-emerald-200' : 'text-gray-600'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Memory Training Cards */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredMemories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Keine Erinnerungen in dieser Kategorie</p>
              </div>
            ) : (
              filteredMemories.map(memory => (
                <MemoryTrainingCard
                  key={memory.id}
                  memory={memory}
                  characterId={characterId}
                  onTrained={() => setTrainedCount(c => c + 1)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}