import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, MessageCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Characters() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.AICharacter.filter({ is_active: true })
  });

  const filteredCharacters = characters.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defaultAvatar = (name) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link to={createPageUrl('Feed')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">AI Characters</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search characters..."
              className="bg-white/5 border-white/10 text-white pl-11 placeholder-gray-500"
            />
          </div>
        </div>
      </header>

      {/* Characters List */}
      <main className="container mx-auto max-w-2xl px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCharacters.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={createPageUrl(`ChatView?characterId=${character.id}`)}>
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <img
                        src={character.avatar_url || defaultAvatar(character.name)}
                        alt={character.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{character.name}</h3>
                        <p className="text-sm text-gray-500">@{character.username}</p>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{character.bio}</p>
                      </div>
                      <MessageCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {filteredCharacters.length === 0 && (
              <div className="text-center py-20">
                <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">No characters found</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}