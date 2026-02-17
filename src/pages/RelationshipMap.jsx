import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Share2, Loader2, Info, BarChart3, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';
import RelationshipMapCanvas from '@/components/relationship/RelationshipMapCanvas';
import ConnectionDetail from '@/components/relationship/ConnectionDetail';
import CharacterQuickProfile from '@/components/relationship/CharacterQuickProfile';
import MapFilters from '@/components/relationship/MapFilters';
import MapStatsPanel from '@/components/relationship/MapStatsPanel';
import NextHeader from '@/components/navigation/NextHeader';

const ROMANTIC_TYPES = ['Partner/in', 'Schwarm', 'Ex-Partner/in', 'Ehemann/Ehefrau', 'Verlobte/r', 'Affäre', 'Jugendliebe', 'Sandkastenliebe'];
const FAMILY_TYPES = ['Mutter', 'Vater', 'Schwester', 'Bruder', 'Tochter', 'Sohn', 'Großmutter/Großvater', 'Cousin/Cousine', 'Tante/Onkel'];
const FRIEND_TYPES = ['Bester Freund/Beste Freundin', 'Guter Freund/Gute Freundin', 'Bekannte/r', 'Kindheitsfreund/in', 'Online-Freund/in', 'Seelenverwandte/r'];

export default function RelationshipMap() {
  const [selectedLink, setSelectedLink] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showGossip, setShowGossip] = useState(true);
  const [showStats, setShowStats] = useState(false);

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

  const { data: conflicts = [] } = useQuery({
    queryKey: ['all-conflicts'],
    queryFn: () => base44.entities.ConflictEvent.filter({ status: 'active' }),
  });

  const isLoading = charsLoading || msgsLoading || memsLoading;
  const allActive = characters.filter(c => !c.is_archived);

  // Apply filter
  const filteredCharacters = allActive.filter(c => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'strong') return (c.trust_level || 5) >= 7;
    if (activeFilter === 'romantic') return ROMANTIC_TYPES.includes(c.initial_relationship);
    if (activeFilter === 'family') return FAMILY_TYPES.includes(c.initial_relationship);
    if (activeFilter === 'friends') return FRIEND_TYPES.includes(c.initial_relationship);
    if (activeFilter === 'conflict') {
      return conflicts.some(cf => cf.character_id === c.id) || 
             (c.relationship_evolution === 'sich_entfernend') ||
             (c.jealousy_level || 3) >= 7;
    }
    return true;
  });

  // Compute stats
  const stats = {
    totalConnections: allActive.length,
    strongBonds: allActive.filter(c => (c.trust_level || 5) >= 7).length,
    avgTrust: allActive.length > 0 ? (allActive.reduce((s, c) => s + (c.trust_level || 5), 0) / allActive.length).toFixed(1) : '0',
    topCharacter: (() => {
      const counts = {};
      messages.forEach(m => { if (m.character_id) counts[m.character_id] = (counts[m.character_id] || 0) + 1; });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      return top ? allActive.find(c => c.id === top[0])?.name : null;
    })()
  };

  const handleSelectCharacter = (char) => {
    setSelectedLink(null);
    setSelectedCharacter(char);
  };

  const handleSelectLink = (link) => {
    setSelectedCharacter(null);
    setSelectedLink(link);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col auto-theme">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/[0.06] p-4 auto-theme-header">
        <div className="flex items-center gap-3">
          <NextHeader>
            <span className="text-xs text-gray-500 ml-1">{allActive.length} verbunden</span>
          </NextHeader>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowStats(!showStats)}
              className={`text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 ${showStats ? 'text-emerald-400' : ''}`}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Panel (expandable) */}
      <AnimatePresence>
        {showStats && (
          <MapStatsPanel characters={allActive} messages={messages} memories={memories} />
        )}
      </AnimatePresence>

      {/* Filters */}
      <MapFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showGossip={showGossip}
        onToggleGossip={() => setShowGossip(!showGossip)}
        stats={stats}
      />

      {/* Legend */}
      <div className="px-4 py-1.5 flex items-center gap-3 text-[9px] text-gray-600 border-b border-white/[0.03] overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-4 h-[3px] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
          <span>Stark</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-4 h-[2px] rounded-full bg-emerald-400/40" />
          <span>Mittel</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-4 h-[1px] rounded-full bg-gray-500/40" />
          <span>Schwach</span>
        </div>
        {showGossip && (
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-4 h-0 border border-dashed border-gray-500/40" />
            <span>Klatsch</span>
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto shrink-0 text-emerald-500/50">
          <Info className="w-2.5 h-2.5" />
          <span>Tippe Linie/Avatar</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
            <Share2 className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-500">
              {activeFilter !== 'all' ? 'Keine Charaktere in dieser Kategorie.' : 'Noch keine Charaktere.'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {activeFilter !== 'all' ? 'Wechsle den Filter oder erstelle passende Beziehungen.' : 'Erstelle Charaktere und chatte mit ihnen.'}
            </p>
            {activeFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter('all')}
                className="mt-3 text-emerald-400 hover:text-emerald-300"
              >
                Alle anzeigen
              </Button>
            )}
          </div>
        ) : (
          <RelationshipMapCanvas
            characters={filteredCharacters}
            memories={memories}
            messages={messages}
            sharedMemories={showGossip ? sharedMemories : []}
            user={user}
            onSelectLink={handleSelectLink}
            onSelectCharacter={handleSelectCharacter}
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

        {/* Character Quick Profile */}
        <AnimatePresence>
          {selectedCharacter && !selectedLink && (
            <CharacterQuickProfile
              character={selectedCharacter}
              messages={messages}
              memories={memories}
              onClose={() => setSelectedCharacter(null)}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="pb-16" />
      <BottomNav user={user} />
    </div>
  );
}