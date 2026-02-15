import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, TrendingUp, Brain, Clock, BarChart3, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MoodBadge from '@/components/character/MoodBadge';
import DevelopmentStats from '@/components/development/DevelopmentStats';
import AttributeRadarChart from '@/components/development/AttributeRadarChart';
import RelationshipTimeline from '@/components/development/RelationshipTimeline';
import KeyMemoriesPanel from '@/components/development/KeyMemoriesPanel';

export default function CharacterDevelopment() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: character, isLoading: charLoading } = useQuery({
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

  const { data: memories = [] } = useQuery({
    queryKey: ['memories', characterId, user?.email],
    queryFn: () => base44.entities.CharacterMemory.filter({ character_id: characterId, user_email: user.email }),
    enabled: !!characterId && !!user
  });

  const { data: events = [] } = useQuery({
    queryKey: ['relationship-events', characterId, user?.email],
    queryFn: () => base44.entities.RelationshipEvent.filter({ character_id: characterId, user_email: user.email }, '-created_date', 100),
    enabled: !!characterId && !!user
  });

  if (charLoading || !character) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

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
          <img
            src={character.avatar_url || defaultAvatar}
            alt={character.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold truncate">{character.name}</h1>
              {character.current_mood && <MoodBadge mood={character.current_mood} size="sm" />}
            </div>
            <p className="text-xs text-gray-500">Charakterentwicklung</p>
          </div>
        </div>
      </header>

      {/* Radar Chart */}
      <div className="p-4">
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4" />
            Persönlichkeitsprofil
          </h3>
          <AttributeRadarChart character={character} />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full bg-[#1a1a1a] border border-white/5 mb-4">
            <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-emerald-600 text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="memories" className="flex-1 data-[state=active]:bg-emerald-600 text-xs">
              <Brain className="w-3.5 h-3.5 mr-1.5" />
              Erinnerungen
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 data-[state=active]:bg-emerald-600 text-xs">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Verlauf
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DevelopmentStats
              character={character}
              memories={memories}
              messages={messages}
              events={events}
            />
          </TabsContent>

          <TabsContent value="memories">
            <KeyMemoriesPanel memories={memories} />
          </TabsContent>

          <TabsContent value="timeline">
            <RelationshipTimeline events={events} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}