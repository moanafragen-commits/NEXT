import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Share2, Loader2, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';
import RelationshipMapCanvas from '@/components/relationship/RelationshipMapCanvas';
import ConnectionDetail from '@/components/relationship/ConnectionDetail';
import NextHeader from '@/components/navigation/NextHeader';

export default function RelationshipMap() {
  const [selectedLink, setSelectedLink] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: characters = [], isLoading: charsLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date', 50)
  });

  const { data: messages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 500)
  });

  const { data: memories = [], isLoading: memsLoading } = useQuery({
    queryKey: ['all-memories'],
    queryFn: () => base44.entities.CharacterMemory.list('-created_date', 200)
  });

  const { data: sharedMemories = [] } = useQuery({
    queryKey: ['shared-memories'],
    queryFn: () => base44.entities.SharedMemory.list('-created_date', 100)
  });

  const { data: relationshipEvents = [] } = useQuery({
    queryKey: ['relationship-events'],
    queryFn: () => base44.entities.RelationshipEvent.list('-created_date', 50)
  });

  const isLoading = charsLoading || msgsLoading || memsLoading;
  const activeCharacters = characters.filter(c => !c.is_archived);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col auto-theme">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/[0.06] p-4 auto-theme-header">
        <div className="flex items-center gap-3">
          <NextHeader>
            <span className="text-xs text-gray-500 ml-1">{activeCharacters.length} verbunden</span>
          </NextHeader>
        </div>
      </header>

      {/* Legend */}
      <div className="px-4 py-2.5 flex items-center gap-3 text-[10px] text-gray-500 border-b border-white/[0.04] overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-5 h-[3px] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
          <span>Stark</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-5 h-[2px] rounded-full bg-emerald-400/40" />
          <span>Mittel</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-5 h-[1px] rounded-full bg-gray-500/40" />
          <span>Schwach</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-5 h-0 border border-dashed border-gray-500/40" />
          <span>Klatsch</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto shrink-0 text-emerald-500/60">
          <Info className="w-3 h-3" />
          <span>Tippe auf Linie</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : activeCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
            <Share2 className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-500">Noch keine Charaktere.</p>
            <p className="text-xs text-gray-600 mt-1">Erstelle Charaktere und chatte mit ihnen, um dein Beziehungsnetzwerk aufzubauen.</p>
          </div>
        ) : (
          <RelationshipMapCanvas
            characters={activeCharacters}
            memories={memories}
            messages={messages}
            sharedMemories={sharedMemories}
            user={user}
            onSelectLink={(link) => setSelectedLink(link)}
            onSelectCharacter={(char) => {
              window.location.href = createPageUrl(`CharacterInfo?characterId=${char.id}`);
            }}
          />
        )}

        {/* Connection Detail Panel */}
        <AnimatePresence>
          {selectedLink && (
            <ConnectionDetail
              link={selectedLink}
              characters={characters}
              relationshipEvents={relationshipEvents}
              onClose={() => setSelectedLink(null)}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="pb-16" />
      <BottomNav user={user} />
    </div>
  );
}