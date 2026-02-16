import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Moon, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const ATMOSPHERE_STYLES = {
  mystisch: 'from-purple-900/40 to-indigo-900/40',
  bedrohlich: 'from-red-900/40 to-gray-900/40',
  romantisch: 'from-pink-900/40 to-rose-900/40',
  surreal: 'from-cyan-900/40 to-purple-900/40',
  friedlich: 'from-green-900/40 to-teal-900/40',
  chaotisch: 'from-orange-900/40 to-red-900/40',
  nostalgisch: 'from-amber-900/40 to-yellow-900/40',
};

export default function DreamWorldPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const dreamId = urlParams.get('dreamId');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me() });
  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => { const c = await base44.entities.Character.filter({ id: characterId }); return c[0]; },
    enabled: !!characterId
  });
  const { data: dream } = useQuery({
    queryKey: ['dream', dreamId],
    queryFn: async () => { const d = await base44.entities.CharacterDream.filter({ id: dreamId }); return d[0]; },
    enabled: !!dreamId
  });
  const { data: dreamWorlds = [] } = useQuery({
    queryKey: ['dream-world', dreamId],
    queryFn: () => base44.entities.DreamWorld.filter({ dream_id: dreamId }, 'scene_number'),
    enabled: !!dreamId
  });

  const currentScene = dreamWorlds.find(s => s.status === 'active');

  const enterDreamMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Ein Charakter namens ${character.name} hatte folgenden Traum: "${dream.dream_content}"
Traumtyp: ${dream.dream_type}

Der Nutzer "betritt" diesen Traum. Erstelle die erste interaktive Szene.
Beschreibe die surreale Umgebung (2-3 Sätze) und biete 3 Wahlmöglichkeiten.`,
        response_json_schema: {
          type: "object",
          properties: {
            scene: { type: "string" },
            atmosphere: { type: "string", enum: ["mystisch", "bedrohlich", "romantisch", "surreal", "friedlich", "chaotisch", "nostalgisch"] },
            choices: { type: "array", items: { type: "object", properties: { label: { type: "string" }, emoji: { type: "string" }, outcome: { type: "string" } } } }
          }
        }
      });

      return base44.entities.DreamWorld.create({
        dream_id: dreamId,
        character_id: characterId,
        user_email: user.email,
        scene_description: result.scene,
        atmosphere: result.atmosphere || 'mystisch',
        choices: result.choices || [],
        scene_number: 1,
        status: 'active'
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dream-world', dreamId] })
  });

  const choiceMutation = useMutation({
    mutationFn: async (choiceIndex) => {
      const choice = currentScene.choices[choiceIndex];
      const sceneNum = currentScene.scene_number + 1;
      
      // Complete current scene
      await base44.entities.DreamWorld.update(currentScene.id, { 
        chosen_path: choiceIndex, 
        status: 'completed' 
      });

      if (sceneNum > (currentScene.max_scenes || 5)) {
        // Dream ends
        return { ended: true, conclusion: choice.outcome };
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Traumwelt von ${character.name}. Bisherige Szene: "${currentScene.scene_description}"
Der Nutzer wählte: "${choice.label}" (${choice.outcome})
Szene ${sceneNum} von ${currentScene.max_scenes || 5}.

Erstelle die nächste Traumszene basierend auf der Wahl. ${sceneNum >= (currentScene.max_scenes || 5) ? 'Dies ist die letzte Szene - bringe den Traum zu einem Ende.' : ''}`,
        response_json_schema: {
          type: "object",
          properties: {
            scene: { type: "string" },
            atmosphere: { type: "string", enum: ["mystisch", "bedrohlich", "romantisch", "surreal", "friedlich", "chaotisch", "nostalgisch"] },
            choices: { type: "array", items: { type: "object", properties: { label: { type: "string" }, emoji: { type: "string" }, outcome: { type: "string" } } } }
          }
        }
      });

      return base44.entities.DreamWorld.create({
        dream_id: dreamId,
        character_id: characterId,
        user_email: user.email,
        scene_description: result.scene,
        atmosphere: result.atmosphere || 'mystisch',
        choices: result.choices || [],
        scene_number: sceneNum,
        status: sceneNum >= (currentScene.max_scenes || 5) ? 'completed' : 'active'
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dream-world', dreamId] })
  });

  if (!character || !dream) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const atmosphere = currentScene?.atmosphere || 'mystisch';
  const bgStyle = ATMOSPHERE_STYLES[atmosphere] || ATMOSPHERE_STYLES.mystisch;
  const allCompleted = dreamWorlds.length > 0 && !currentScene;

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-white bg-gradient-to-b ${bgStyle}`}>
      <header className="sticky top-0 z-10 glass border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl(`Chat?characterId=${characterId}`)}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Moon className="w-5 h-5 text-purple-400" />
          <div>
            <h1 className="text-lg font-bold">Traumwelt</h1>
            <p className="text-xs text-gray-500">{character.name}s Traum</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {/* Original Dream */}
        <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20 mb-6">
          <p className="text-xs text-purple-400 mb-1">🌙 Der Traum</p>
          <p className="text-sm text-gray-300 italic">"{dream.dream_content}"</p>
        </div>

        {/* Scene History */}
        {dreamWorlds.filter(s => s.status === 'completed').map((scene, i) => (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5"
          >
            <p className="text-[10px] text-gray-600 mb-1">Szene {scene.scene_number}</p>
            <p className="text-xs text-gray-400">{scene.scene_description}</p>
            {scene.chosen_path >= 0 && scene.choices?.[scene.chosen_path] && (
              <p className="text-[10px] text-emerald-400 mt-1">
                ➜ {scene.choices[scene.chosen_path].emoji} {scene.choices[scene.chosen_path].label}
              </p>
            )}
          </motion.div>
        ))}

        {/* Current Scene */}
        {currentScene ? (
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-purple-500/20"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-purple-400">Szene {currentScene.scene_number}/{currentScene.max_scenes || 5}</span>
              <span className="text-xs text-gray-500 capitalize">{currentScene.atmosphere}</span>
            </div>
            
            <p className="text-sm text-gray-200 leading-relaxed mb-5">{currentScene.scene_description}</p>
            
            <div className="space-y-2">
              {(currentScene.choices || []).map((choice, i) => (
                <button
                  key={i}
                  onClick={() => choiceMutation.mutate(i)}
                  disabled={choiceMutation.isPending}
                  className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 text-left transition-all press-effect disabled:opacity-50"
                >
                  <span className="text-sm text-white">
                    {choice.emoji} {choice.label}
                  </span>
                </button>
              ))}
            </div>

            {choiceMutation.isPending && (
              <div className="flex justify-center mt-4">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
            )}
          </motion.div>
        ) : allCompleted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10"
          >
            <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-1">Traum beendet</h3>
            <p className="text-sm text-gray-400 mb-4">Du bist aus {character.name}s Traum aufgewacht.</p>
            <Link to={createPageUrl(`Chat?characterId=${characterId}`)}>
              <Button className="bg-purple-600 hover:bg-purple-500">
                Zurück zum Chat
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="text-center py-10">
            <Moon className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">In den Traum eintreten?</h3>
            <p className="text-sm text-gray-500 mb-6">Erlebe {character.name}s Traum interaktiv</p>
            <Button
              onClick={() => enterDreamMutation.mutate()}
              disabled={enterDreamMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
            >
              {enterDreamMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Moon className="w-4 h-4 mr-2" />}
              Traum betreten
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}