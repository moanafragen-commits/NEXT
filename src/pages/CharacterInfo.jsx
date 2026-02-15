import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, User, BookOpen, MessageCircle, Settings, Sparkles, Calendar, Clock, Trash2, Plus, Brain, Heart, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from 'framer-motion';
import AddMemoryModal from '@/components/memory/AddMemoryModal';
import MoodBadge from '@/components/character/MoodBadge';
import RelationshipPanel from '@/components/character/RelationshipPanel';
import MoodMotivationPanel from '@/components/character/MoodMotivationPanel';

export default function CharacterInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const queryClient = useQueryClient();
  const [showAddMemory, setShowAddMemory] = useState(false);
  
  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });
  
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', characterId],
    queryFn: () => base44.entities.ChatMessage.filter({ character_id: characterId }),
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
  
  const deleteMemoryMutation = useMutation({
    mutationFn: (memoryId) => base44.entities.CharacterMemory.delete(memoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', characterId] });
    }
  });
  
  if (!character) return null;
  
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
  
  const memoryTypeLabels = {
    fact: '📌 Fakt',
    preference: '❤️ Vorliebe',
    event: '📅 Ereignis',
    emotion: '😊 Emotion',
    relationship: '🤝 Beziehung'
  };
  
  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl(`Chat?characterId=${characterId}`)}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Charakter-Info</h1>
        </div>
      </header>
      
      <div className="pb-6">
        {/* Avatar & Name Section */}
        <div className="bg-[#1a1a1a] py-8 flex flex-col items-center">
          <img 
            src={character.avatar_url || defaultAvatar}
            alt={character.name}
            className="w-32 h-32 rounded-full object-cover ring-4 ring-emerald-500/30 mb-4"
          />
          <h2 className="text-2xl font-bold">{character.name}</h2>
          <p className="text-gray-400 mt-1">{character.status || 'Kein Status'}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
              {character.category}
            </Badge>
            {character.current_mood && <MoodBadge mood={character.current_mood} />}
          </div>
        </div>
        
        <Separator className="bg-white/5" />
        
        {/* Stats */}
        <div className="bg-[#1a1a1a] py-4 px-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{messages.length}</div>
            <div className="text-xs text-gray-500">Nachrichten</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{memories.length}</div>
            <div className="text-xs text-gray-500">Erinnerungen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{character.creativity || 50}%</div>
            <div className="text-xs text-gray-500">Kreativität</div>
          </div>
        </div>
        
        <Separator className="bg-white/5" />
        
        {/* Personality Section */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold">Persönlichkeit</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {character.personality}
          </p>
        </div>
        
        {character.biography && (
          <>
            <Separator className="bg-white/5" />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-semibold">Biografie</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {character.biography}
              </p>
            </div>
          </>
        )}
        
        <Separator className="bg-white/5" />
        
        {/* Mood & Motivation */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Target className="w-5 h-5" />
            <h3 className="font-semibold">Stimmung & Ziele</h3>
          </div>
          <MoodMotivationPanel character={character} />
        </div>

        <Separator className="bg-white/5" />
        
        {/* Relationship */}
        {user && (
          <>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Heart className="w-5 h-5" />
                <h3 className="font-semibold">Beziehung definieren</h3>
              </div>
              <RelationshipPanel 
                characterId={characterId}
                userEmail={user.email}
                memories={memories}
              />
            </div>
            <Separator className="bg-white/5" />
          </>
        )}

        {/* Behavior Settings */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Settings className="w-5 h-5" />
            <h3 className="font-semibold">Verhaltenseinstellungen</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Schreibstil</span>
              <span className="text-white capitalize">{character.writing_style}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Antwortlänge</span>
              <span className="text-white capitalize">{character.response_length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Sprache</span>
              <span className="text-white">{character.language_preference}</span>
            </div>
          </div>
        </div>
        
        {/* Memories Section */}
        <Separator className="bg-white/5" />
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Brain className="w-5 h-5" />
              <h3 className="font-semibold">Erinnerungen & Beziehung</h3>
            </div>
            <Button
              onClick={() => setShowAddMemory(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
          
          {memories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Noch keine Erinnerungen vorhanden.</p>
              <p className="text-xs mt-1">Definiere deine Beziehung zu {character.name}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {memories.map((memory) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#262626] rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {memory.relation_type && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {memory.relation_type}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs border-white/20">
                          {memoryTypeLabels[memory.memory_type] || memory.memory_type}
                        </Badge>
                        {memory.importance_level && (
                          <Badge 
                            className={`text-xs ${
                              memory.importance_level === 'hoch' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                              memory.importance_level === 'mittel' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              'bg-gray-500/20 text-gray-300 border-gray-500/30'
                            }`}
                          >
                            {memory.importance_level}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{memory.memory_text || memory.content}</p>
                      {memory.last_interaction_date && (
                        <p className="text-xs text-gray-500 mt-2">
                          Letzte Interaktion: {new Date(memory.last_interaction_date).toLocaleDateString('de-DE')}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMemoryMutation.mutate(memory.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {character.greeting && (
          <>
            <Separator className="bg-white/5" />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">Begrüßung</h3>
              </div>
              <p className="text-gray-300 text-sm italic">"{character.greeting}"</p>
            </div>
          </>
        )}
      </div>

      {user && (
        <AddMemoryModal
          open={showAddMemory}
          onClose={() => setShowAddMemory(false)}
          characterId={characterId}
          userEmail={user.email}
        />
      )}
    </div>
  );
}