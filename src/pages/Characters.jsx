import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, MessageCircle, Sparkles, Trash2, Star, Plus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';

export default function Characters() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: async (characterId) => {
      const msgs = await base44.entities.ChatMessage.filter({ character_id: characterId });
      await Promise.all(msgs.map(m => base44.entities.ChatMessage.delete(m.id)));
      const memories = await base44.entities.CharacterMemory.filter({ character_id: characterId });
      await Promise.all(memories.map(m => base44.entities.CharacterMemory.delete(m.id)));
      await base44.entities.Character.delete(characterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (character) => {
      await base44.entities.Character.update(character.id, { is_favorite: !character.is_favorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    }
  });

  const filteredCharacters = characters.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.occupation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defaultAvatar = (name) => `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${name}`;

  const genderLabel = (g) => {
    if (g === 'männlich') return '♂';
    if (g === 'weiblich') return '♀';
    if (g === 'non-binär') return '⚧';
    return null;
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold flex-1">Meine Charaktere</h1>
            <span className="text-sm text-gray-500">{characters.length} Charakter{characters.length !== 1 ? 'e' : ''}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Charaktere suchen..."
              className="bg-[#262626] border-0 text-white pl-11 rounded-xl placeholder-gray-500 focus-visible:ring-emerald-500/50"
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Keine Charaktere gefunden</p>
            <p className="text-gray-500 text-sm">Erstelle deinen ersten Charakter auf der Startseite.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredCharacters.map((character, index) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Link to={createPageUrl(`Chat?characterId=${character.id}`)} className="relative flex-shrink-0">
                      <img
                        src={character.avatar_url || defaultAvatar(character.name)}
                        alt={character.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/20"
                      />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#1a1a1a]" />
                    </Link>

                    <Link to={createPageUrl(`Chat?characterId=${character.id}`)} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">{character.name}</h3>
                        {genderLabel(character.gender) && (
                          <span className="text-sm text-gray-400">{genderLabel(character.gender)}</span>
                        )}
                        {character.is_favorite && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {character.category && character.category !== 'Andere' && (
                          <Badge className="bg-emerald-500/15 text-emerald-400 text-[10px] px-1.5 py-0">{character.category}</Badge>
                        )}
                        {character.occupation && (
                          <span className="text-xs text-gray-500">{character.occupation}</span>
                        )}
                        {character.age && (
                          <span className="text-xs text-gray-500">• {character.age}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate mt-1">
                        {character.status || character.personality?.slice(0, 60) + '...'}
                      </p>
                    </Link>

                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavoriteMutation.mutate(character)}
                        className={`h-8 w-8 ${character.is_favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                      >
                        <Star className={`w-4 h-4 ${character.is_favorite ? 'fill-yellow-400' : ''}`} />
                      </Button>
                      <Link to={createPageUrl(`Chat?characterId=${character.id}`)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-emerald-400">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`"${character.name}" und alle zugehörigen Daten endgültig löschen?`)) {
                            deleteCharacterMutation.mutate(character.id);
                          }
                        }}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}