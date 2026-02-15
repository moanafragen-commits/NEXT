import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, Sparkles, Trash2, Star } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';
import CreateCharacterModal from '@/components/chat/CreateCharacterModal';

export default function Characters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const location = useLocation();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('create') === 'true') {
      setShowCreateModal(true);
    }
  }, [location.search]);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

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
      const statuses = await base44.entities.CharacterStatus.filter({ character_id: characterId });
      await Promise.all(statuses.map(s => base44.entities.CharacterStatus.delete(s.id)));
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

  return (
    <div className="min-h-screen bg-white text-black auto-theme">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 auto-theme-header">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-semibold">Entdecken</h1>
            <span className="text-xs text-gray-400 auto-theme-text-secondary">{characters.length} Charakter{characters.length !== 1 ? 'e' : ''}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen..."
              className="bg-gray-100 border-0 text-black pl-10 rounded-xl placeholder-gray-400 focus-visible:ring-gray-300 h-10 text-sm auto-theme-input"
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto pb-20">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Keine Charaktere gefunden</p>
          </div>
        ) : (
          <div>
            <AnimatePresence>
              {filteredCharacters.map((character, index) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                >
                  <Link to={createPageUrl(`Chat?characterId=${character.id}`)} className="flex-shrink-0">
                    <img
                      src={character.avatar_url || defaultAvatar(character.name)}
                      alt={character.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </Link>

                  <Link to={createPageUrl(`Chat?characterId=${character.id}`)} className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[14px] font-semibold text-black truncate">{character.name}</h3>
                      {character.is_favorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {character.category && character.category !== 'Andere' && (
                        <span className="text-[11px] text-gray-400">{character.category}</span>
                      )}
                      {character.occupation && (
                        <span className="text-[11px] text-gray-400">• {character.occupation}</span>
                      )}
                    </div>
                    <p className="text-[12px] text-gray-400 truncate mt-0.5">
                      {character.status || character.personality?.slice(0, 50) + '...'}
                    </p>
                  </Link>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => toggleFavoriteMutation.mutate(character)}
                      className={`p-1.5 rounded-full ${character.is_favorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                    >
                      <Star className={`w-4 h-4 ${character.is_favorite ? 'fill-yellow-500' : ''}`} />
                    </button>
                    <Link to={createPageUrl(`Chat?characterId=${character.id}`)}>
                      <button className="p-1.5 rounded-full text-gray-300 hover:text-black">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`"${character.name}" endgültig löschen?`)) {
                          deleteCharacterMutation.mutate(character.id);
                        }
                      }}
                      className="p-1.5 rounded-full text-gray-300 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <CreateCharacterModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['characters'] })}
      />

      <BottomNav user={user} />
    </div>
  );
}