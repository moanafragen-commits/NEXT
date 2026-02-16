import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, Lock, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import MoodBadge from '@/components/character/MoodBadge';
import BottomNav from '@/components/navigation/BottomNav';
import moment from 'moment';
import { motion } from 'framer-motion';

export default function Diaries() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: characters = [], isLoading: charsLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date', 50)
  });

  const { data: allDiaries = [], isLoading: diariesLoading } = useQuery({
    queryKey: ['all-diaries'],
    queryFn: () => base44.entities.CharacterDiary.list('-created_date', 100)
  });

  const isLoading = charsLoading || diariesLoading;

  // Group diary entries by character
  const characterDiaries = characters.map(char => {
    const entries = allDiaries.filter(d => d.character_id === char.id);
    const latestEntry = entries[0]; // already sorted by -created_date
    return { character: char, entries, latestEntry };
  }).filter(cd => cd.entries.length > 0)
    .sort((a, b) => {
      const dateA = a.latestEntry?.created_date || '';
      const dateB = b.latestEntry?.created_date || '';
      return dateB.localeCompare(dateA);
    });

  // Characters without diary entries
  const emptyCharacters = characters.filter(c => !allDiaries.some(d => d.character_id === c.id));

  return (
    <div className="min-h-screen bg-[#111] text-white auto-theme">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4 auto-theme-header">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl font-bold">Tagebücher</h1>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs ml-auto">
            {allDiaries.length} Einträge
          </Badge>
        </div>
      </header>

      <div className="p-4 space-y-3 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : characterDiaries.length === 0 && emptyCharacters.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Noch keine Tagebücher.</p>
            <p className="text-xs text-gray-600 mt-1">Erstelle Charaktere und chatte mit ihnen – sie schreiben dann Tagebuch.</p>
          </div>
        ) : (
          <>
            {characterDiaries.map((cd, i) => {
              const { character, entries, latestEntry } = cd;
              const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
              const trustLevel = character.trust_level || 5;
              const isLatestSecret = latestEntry?.is_secret && trustLevel < 8;

              return (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={createPageUrl(`CharacterDiary?characterId=${character.id}`)}>
                    <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-colors auto-theme-card">
                      <div className="flex items-center gap-3">
                        <img
                          src={character.avatar_url || defaultAvatar}
                          alt={character.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">{character.name}</h3>
                            {latestEntry?.mood_at_time && <MoodBadge mood={latestEntry.mood_at_time} size="sm" />}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'} · Letzter: {moment(latestEntry?.created_date).fromNow()}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </div>

                      {/* Preview of latest entry */}
                      <div className="mt-3 pl-[60px]">
                        {isLatestSecret ? (
                          <div className="flex items-center gap-2 text-amber-400/60">
                            <Lock className="w-3 h-3" />
                            <span className="text-xs italic">Geheimer Eintrag...</span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic line-clamp-2">
                            "{latestEntry?.content}"
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {emptyCharacters.length > 0 && (
              <div className="mt-6">
                <p className="text-xs text-gray-600 mb-2 px-1">Noch kein Tagebuch:</p>
                <div className="flex flex-wrap gap-2">
                  {emptyCharacters.map(c => {
                    const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${c.name}`;
                    return (
                      <Link key={c.id} to={createPageUrl(`Chat?characterId=${c.id}`)}>
                        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 rounded-full px-3 py-1.5 hover:border-white/10">
                          <img src={c.avatar_url || defaultAvatar} alt={c.name} className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-xs text-gray-500">{c.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav user={user} />
    </div>
  );
}