import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Search, Filter, Grid, List, SortAsc } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CharacterCard from '@/components/chat/CharacterCard';
import { motion } from 'framer-motion';

const CATEGORIES = [
  "Alle", "Freund", "Mentor", "Familie", "Partner", "Kollege",
  "Therapeut", "Coach", "Lehrer", "Berater",
  "Fantasie", "Berühmtheit", "Historisch", "Fiktional",
  "Assistent", "Experte", "Kreativ", "Abenteurer",
  "Anime", "Gaming", "Sci-Fi", "Mystery",
  "Romantisch", "Humorvoll", "Philosophisch", "Andere"
];

export default function CharacterLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('recent'); // recent, name, category
  const queryClient = useQueryClient();

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 100)
  });

  const getLastMessage = (characterId) => {
    return messages.find(m => m.character_id === characterId);
  };

  let filteredCharacters = characters.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.personality?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Alle' || c.category === selectedCategory;
    return matchesSearch && matchesCategory && !c.is_archived;
  });

  // Sorting
  if (sortBy === 'name') {
    filteredCharacters = [...filteredCharacters].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'category') {
    filteredCharacters = [...filteredCharacters].sort((a, b) => a.category.localeCompare(b.category));
  }

  // Group by category for list view
  const groupedCharacters = filteredCharacters.reduce((acc, char) => {
    const cat = char.category || 'Andere';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(char);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Charakter-Bibliothek</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-4 pb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Charaktere durchsuchen..."
              className="w-full bg-[#262626] border-0 text-white pl-11 rounded-xl placeholder-gray-500"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-white/10 max-h-80">
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-white">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-white/10">
                <SelectItem value="recent" className="text-white">Zuletzt erstellt</SelectItem>
                <SelectItem value="name" className="text-white">Name</SelectItem>
                <SelectItem value="category" className="text-white">Kategorie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="p-4">
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>Keine Charaktere gefunden</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-2">
            {filteredCharacters.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <CharacterCard
                  character={character}
                  lastMessage={getLastMessage(character.id)}
                  onClick={() => window.location.href = createPageUrl(`Chat?characterId=${character.id}`)}
                  onDelete={() => {}}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedCharacters).map(([category, chars]) => (
              <div key={category}>
                <h2 className="text-sm font-semibold text-gray-400 mb-3 px-2">{category}</h2>
                <div className="space-y-2">
                  {chars.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      lastMessage={getLastMessage(character.id)}
                      onClick={() => window.location.href = createPageUrl(`Chat?characterId=${character.id}`)}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}