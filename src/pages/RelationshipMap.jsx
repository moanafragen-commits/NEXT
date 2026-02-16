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

  const isLoading = charsLoading || msgsLoading || memsLoading;
  const activeCharacters = characters.filter(c => !c.is_archived);

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col auto-theme">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4 auto-theme-header">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Share2 className="w-5 h-5 text-emerald-400" />
          <div>
            <h1 className="text-lg font-semibold">Beziehungskarte</h1>
            <p className="text-xs text-gray-500">{activeCharacters.length} Charaktere verbunden</p>
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="px-4 py-2 flex items-center gap-4 text-[10px] text-gray-500 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 rounded bg-emerald-400/70" />
          <span>Stark</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 rounded bg-emerald-400/40" />
          <span>Mittel</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 rounded bg-gray-500/30" />
          <span>Schwach</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 rounded border border-dashed border-gray-500/50" />
          <span>Klatsch</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
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