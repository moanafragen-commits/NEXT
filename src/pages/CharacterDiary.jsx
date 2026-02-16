import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, BookOpen, Lock, Heart, Brain, Moon, Sun, Coffee, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MoodBadge from '@/components/character/MoodBadge';
import moment from 'moment';
import { motion } from 'framer-motion';

function DiaryEntry({ entry, character, trustLevel }) {
  const isLocked = entry.is_secret && trustLevel < 8;
  
  const typeIcons = {
    after_chat: <Coffee className="w-4 h-4" />,
    daily_thought: <Brain className="w-4 h-4" />,
    npc_interaction: <Heart className="w-4 h-4" />,
    dream: <Moon className="w-4 h-4" />,
    reflection: <Sun className="w-4 h-4" />
  };

  const typeLabels = {
    after_chat: 'Nach dem Chat',
    daily_thought: 'Gedanke',
    npc_interaction: 'Begegnung',
    dream: 'Traum',
    reflection: 'Reflexion'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">{typeIcons[entry.entry_type] || <BookOpen className="w-4 h-4" />}</span>
          <span className="text-xs text-gray-500">{typeLabels[entry.entry_type] || entry.entry_type}</span>
          {entry.is_secret && <Lock className="w-3 h-3 text-amber-400" />}
        </div>
        <div className="flex items-center gap-2">
          {entry.mood_at_time && <MoodBadge mood={entry.mood_at_time} size="sm" />}
          <span className="text-xs text-gray-600">{moment(entry.created_date).format('DD.MM.YY, HH:mm')}</span>
        </div>
      </div>

      {isLocked ? (
        <div className="text-center py-6">
          <Lock className="w-8 h-8 text-amber-400/30 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Geheimer Eintrag</p>
          <p className="text-xs text-gray-600 mt-1">Vertrauenslevel 8+ nötig um diesen Eintrag zu lesen</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap italic">
            "{entry.content}"
          </p>
          {entry.emotional_summary && (
            <p className="text-xs text-gray-500 border-t border-white/5 pt-2">
              {entry.emotional_summary}
            </p>
          )}
          {entry.npc_involved && (
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
              Mit: {entry.npc_involved}
            </Badge>
          )}
          {entry.topics_discussed && (
            <div className="flex flex-wrap gap-1">
              {entry.topics_discussed.split(',').map((t, i) => (
                <Badge key={i} className="bg-[#262626] text-gray-400 border-white/5 text-xs">
                  {t.trim()}
                </Badge>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default function CharacterDiary() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });

  const { data: diaryEntries = [], isLoading } = useQuery({
    queryKey: ['diary', characterId],
    queryFn: () => base44.entities.CharacterDiary.filter({ character_id: characterId }, '-created_date', 50),
    enabled: !!characterId
  });

  if (!character) return null;

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
  const trustLevel = character.trust_level || 5;

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl(`CharacterInfo?characterId=${characterId}`)}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <img
            src={character.avatar_url || defaultAvatar}
            alt={character.name}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div>
            <h1 className="text-lg font-semibold">{character.name}s Tagebuch</h1>
            <p className="text-xs text-gray-500">{diaryEntries.length} Einträge</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-20">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <p className="text-xs text-emerald-300">
            📖 Hier siehst du was {character.name} nach euren Gesprächen denkt und fühlt – ungefiltert und ehrlich.
            {trustLevel < 8 && ' Manche Einträge sind gesperrt, bis das Vertrauenslevel höher ist.'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : diaryEntries.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Noch keine Tagebucheinträge.</p>
            <p className="text-xs text-gray-600 mt-1">Chatte mit {character.name} – nach Gesprächen schreibt {character.gender === 'weiblich' ? 'sie' : 'er'} manchmal Tagebuch.</p>
          </div>
        ) : (
          diaryEntries.map((entry, i) => (
            <DiaryEntry
              key={entry.id}
              entry={entry}
              character={character}
              trustLevel={trustLevel}
            />
          ))
        )}
      </div>
    </div>
  );
}