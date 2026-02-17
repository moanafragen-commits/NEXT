import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RELATIONSHIP_DYNAMICS = [
  { value: 'gleichberechtigt', emoji: '⚖️', label: 'Gleichberechtigt' },
  { value: 'dominant', emoji: '👑', label: 'Dominant' },
  { value: 'unterwürfig', emoji: '🙇', label: 'Unterwürfig' },
  { value: 'beschützend', emoji: '🛡️', label: 'Beschützend' },
  { value: 'spielerisch', emoji: '🎲', label: 'Spielerisch' },
  { value: 'romantisch_spannend', emoji: '🔥', label: 'Romantisch' },
  { value: 'kalt_distanziert', emoji: '🧊', label: 'Distanziert' },
  { value: 'neckend_flirtend', emoji: '😜', label: 'Neckend' },
  { value: 'toxisch', emoji: '☠️', label: 'Toxisch' },
];

const RELATIONSHIP_TYPES = [
  'Partner/in', 'Schwarm', 'Ex-Partner/in', 'Ehemann/Ehefrau',
  'Bester Freund/Beste Freundin', 'Guter Freund/Gute Freundin', 'Bekannte/r',
  'Mutter', 'Vater', 'Schwester', 'Bruder',
  'Mentor/in', 'Schüler/in', 'Arbeitskollege/Arbeitskollegin', 'Chef/in',
  'Rivale/Rivalin', 'Feind/in', 'Nachbar/in', 'Mitbewohner/in',
  'Therapeut/in', 'Vertraute/r', 'Seelenverwandte/r',
];

export default function RelationshipPanel({ characterId, userEmail, memories }) {
  const queryClient = useQueryClient();
  const [showMore, setShowMore] = useState(false);

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });

  const [relType, setRelType] = useState('');
  const [dynamic, setDynamic] = useState('gleichberechtigt');
  const [trust, setTrust] = useState(5);
  const [jealousy, setJealousy] = useState(3);
  const [petNames, setPetNames] = useState('');
  const [backstory, setBackstory] = useState('');
  const [sharedMems, setSharedMems] = useState('');
  const [insideJokes, setInsideJokes] = useState('');
  const [boundaries, setBoundaries] = useState('');
  const [loveLanguage, setLoveLanguage] = useState('');
  const [evolution, setEvolution] = useState('statisch');
  const [attachmentStyle, setAttachmentStyle] = useState('sicher');
  const [hasChanges, setHasChanges] = useState(false);

  // Sync from character data
  useEffect(() => {
    if (!character) return;
    setRelType(character.initial_relationship || '');
    setDynamic(character.relationship_dynamic || 'gleichberechtigt');
    setTrust(character.trust_level || 5);
    setJealousy(character.jealousy_level || 3);
    setPetNames(character.pet_names || '');
    setBackstory(character.relationship_backstory || '');
    setSharedMems(character.shared_memories || '');
    setInsideJokes(character.inside_jokes || '');
    setBoundaries(character.relationship_boundaries || '');
    setLoveLanguage(character.love_language || '');
    setEvolution(character.relationship_evolution || 'statisch');
    setAttachmentStyle(character.attachment_style || 'sicher');
  }, [character]);

  const markChanged = () => setHasChanges(true);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Character.update(characterId, {
        initial_relationship: relType,
        relationship_dynamic: dynamic,
        trust_level: trust,
        jealousy_level: jealousy,
        pet_names: petNames,
        relationship_backstory: backstory,
        shared_memories: sharedMems,
        inside_jokes: insideJokes,
        relationship_boundaries: boundaries,
        love_language: loveLanguage || undefined,
        relationship_evolution: evolution,
        attachment_style: attachmentStyle,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', characterId] });
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      setHasChanges(false);
    }
  });

  const trustLabel = trust <= 2 ? 'Misstrauisch' : trust <= 4 ? 'Vorsichtig' : trust <= 6 ? 'Neutral' : trust <= 8 ? 'Vertrauensvoll' : 'Blindes Vertrauen';
  const currentDynamic = RELATIONSHIP_DYNAMICS.find(d => d.value === dynamic);

  return (
    <div className="space-y-4">
      {/* Current Display */}
      <div className="flex items-center gap-3 p-3 bg-[#262626] rounded-xl">
        <div className="text-3xl">{currentDynamic?.emoji || '⚖️'}</div>
        <div className="flex-1">
          <p className="font-medium text-white text-sm">{relType || 'Nicht definiert'}</p>
          <p className="text-xs text-gray-400">{currentDynamic?.label || dynamic} · {trustLabel}</p>
          {petNames && <p className="text-xs text-amber-400 mt-0.5">Nennt dich „{petNames.split(',')[0].trim()}"</p>}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-emerald-400">{trust}</span>
          <span className="text-[10px] text-gray-500">Vertrauen</span>
        </div>
      </div>

      {/* Relationship Type */}
      <div>
        <Label className="text-gray-300 text-xs mb-2 block">Beziehungstyp</Label>
        <Select value={relType} onValueChange={(v) => { setRelType(v); markChanged(); }}>
          <SelectTrigger className="bg-[#262626] border-white/10 text-white">
            <SelectValue placeholder="Beziehung wählen..." />
          </SelectTrigger>
          <SelectContent className="bg-[#262626] border-white/10 max-h-60">
            {RELATIONSHIP_TYPES.map(t => (
              <SelectItem key={t} value={t} className="text-white hover:bg-white/10">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dynamic Picker */}
      <div>
        <Label className="text-gray-300 text-xs mb-2 block">Beziehungsdynamik</Label>
        <div className="grid grid-cols-3 gap-2">
          {RELATIONSHIP_DYNAMICS.map((d) => (
            <button
              key={d.value}
              onClick={() => { setDynamic(d.value); markChanged(); }}
              className={`p-2 rounded-lg text-xs font-medium transition-all border ${
                dynamic === d.value
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 ring-1 ring-emerald-500/20'
                  : 'bg-[#262626] text-gray-400 border-white/5 hover:border-white/10'
              }`}
            >
              <span className="block text-base mb-0.5">{d.emoji}</span>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trust & Jealousy */}
      <div className="space-y-3 p-3 bg-[#262626] rounded-xl">
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-gray-300 text-xs">Vertrauen</Label>
            <span className="text-xs text-emerald-400 font-medium">{trust}/10</span>
          </div>
          <Slider value={[trust]} onValueChange={([v]) => { setTrust(v); markChanged(); }} min={1} max={10} step={1} className="[&_[role=slider]]:bg-emerald-500" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-gray-300 text-xs">Eifersucht</Label>
            <span className="text-xs text-orange-400 font-medium">{jealousy}/10</span>
          </div>
          <Slider value={[jealousy]} onValueChange={([v]) => { setJealousy(v); markChanged(); }} min={1} max={10} step={1} className="[&_[role=slider]]:bg-orange-500" />
        </div>
      </div>

      {/* Pet Names */}
      <div>
        <Label className="text-gray-300 text-xs mb-1 block">Kosenamen (wie du genannt wirst)</Label>
        <Input
          value={petNames}
          onChange={(e) => { setPetNames(e.target.value); markChanged(); }}
          placeholder="z.B. Schatz, Babe, Liebling"
          className="bg-[#262626] border-white/10 text-white placeholder-gray-500 text-sm"
        />
      </div>

      {/* Expandable section */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 w-full justify-center py-1"
      >
        {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {showMore ? 'Weniger anzeigen' : 'Mehr Optionen (Geschichte, Grenzen, ...)'}
      </button>

      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div>
              <Label className="text-gray-300 text-xs mb-1 block">Beziehungs-Geschichte</Label>
              <Textarea value={backstory} onChange={(e) => { setBackstory(e.target.value); markChanged(); }} placeholder="Wie habt ihr euch kennengelernt?" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px] text-sm" />
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1 block">Gemeinsame Erinnerungen</Label>
              <Textarea value={sharedMems} onChange={(e) => { setSharedMems(e.target.value); markChanged(); }} placeholder="Besondere gemeinsame Momente..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px] text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Insider-Witze</Label>
                <Textarea value={insideJokes} onChange={(e) => { setInsideJokes(e.target.value); markChanged(); }} placeholder="Witze die nur ihr versteht..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[60px] text-sm" />
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Grenzen</Label>
                <Textarea value={boundaries} onChange={(e) => { setBoundaries(e.target.value); markChanged(); }} placeholder="No-Gos in der Beziehung..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[60px] text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Liebessprache</Label>
                <Select value={loveLanguage} onValueChange={(v) => { setLoveLanguage(v); markChanged(); }}>
                  <SelectTrigger className="bg-[#262626] border-white/10 text-white text-sm"><SelectValue placeholder="Wählen..." /></SelectTrigger>
                  <SelectContent className="bg-[#262626] border-white/10">
                    <SelectItem value="Worte der Bestätigung" className="text-white">💬 Worte</SelectItem>
                    <SelectItem value="Geschenke" className="text-white">🎁 Geschenke</SelectItem>
                    <SelectItem value="Hilfsbereitschaft" className="text-white">🤲 Hilfsbereitschaft</SelectItem>
                    <SelectItem value="Körperkontakt" className="text-white">🤗 Körperkontakt</SelectItem>
                    <SelectItem value="Zweisamkeit" className="text-white">👫 Zweisamkeit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Bindungsstil</Label>
                <Select value={attachmentStyle} onValueChange={(v) => { setAttachmentStyle(v); markChanged(); }}>
                  <SelectTrigger className="bg-[#262626] border-white/10 text-white text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#262626] border-white/10">
                    <SelectItem value="sicher" className="text-white">🟢 Sicher</SelectItem>
                    <SelectItem value="ängstlich" className="text-white">🟡 Ängstlich</SelectItem>
                    <SelectItem value="vermeidend" className="text-white">🔴 Vermeidend</SelectItem>
                    <SelectItem value="desorganisiert" className="text-white">🟠 Desorganisiert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1 block">Beziehungsentwicklung</Label>
              <Select value={evolution} onValueChange={(v) => { setEvolution(v); markChanged(); }}>
                <SelectTrigger className="bg-[#262626] border-white/10 text-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#262626] border-white/10">
                  <SelectItem value="statisch" className="text-white">⏸️ Statisch</SelectItem>
                  <SelectItem value="sich_annähernd" className="text-white">💞 Sich annähernd</SelectItem>
                  <SelectItem value="sich_entfernend" className="text-white">💨 Sich entfernend</SelectItem>
                  <SelectItem value="schwankend" className="text-white">🌊 Schwankend</SelectItem>
                  <SelectItem value="sich_vertiefend" className="text-white">🌹 Sich vertiefend</SelectItem>
                  <SelectItem value="kompliziert" className="text-white">🔀 Kompliziert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save */}
      {hasChanges && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Speichern...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Beziehung speichern</>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}