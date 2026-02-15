import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

const MEMORY_TYPES = [
  { value: 'fact', label: '📌 Fakt' },
  { value: 'preference', label: '❤️ Vorliebe' },
  { value: 'event', label: '📅 Ereignis' },
  { value: 'emotion', label: '😊 Emotion' },
  { value: 'relationship', label: '🤝 Beziehung' },
  { value: 'goal', label: '🎯 Ziel' },
  { value: 'habit', label: '🔄 Gewohnheit' },
  { value: 'opinion', label: '💭 Meinung' },
  { value: 'experience', label: '⭐ Erfahrung' },
];

const MEMORY_CATEGORIES = [
  { value: 'user_preferences', label: '⚙️ Nutzer-Vorlieben' },
  { value: 'past_events', label: '📖 Vergangene Ereignisse' },
  { value: 'user_goals', label: '🎯 Nutzer-Ziele' },
  { value: 'personal_info', label: '👤 Persönliche Infos' },
  { value: 'shared_experiences', label: '🤝 Gemeinsame Erlebnisse' },
  { value: 'inside_jokes', label: '😂 Insider-Witze' },
  { value: 'important_dates', label: '📅 Wichtige Daten' },
  { value: 'general', label: '📝 Allgemein' },
];

export default function EditMemoryModal({ open, onClose, memory, characterId, userEmail }) {
  const [memoryText, setMemoryText] = useState('');
  const [memoryType, setMemoryType] = useState('fact');
  const [memoryCategory, setMemoryCategory] = useState('general');
  const [importanceLevel, setImportanceLevel] = useState('mittel');
  const queryClient = useQueryClient();

  const isEditing = !!memory;

  useEffect(() => {
    if (memory) {
      setMemoryText(memory.memory_text || '');
      setMemoryType(memory.memory_type || 'fact');
      setMemoryCategory(memory.memory_category || 'general');
      setImportanceLevel(memory.importance_level || 'mittel');
    } else {
      setMemoryText('');
      setMemoryType('fact');
      setMemoryCategory('general');
      setImportanceLevel('mittel');
    }
  }, [memory, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        character_id: characterId,
        user_email: userEmail,
        memory_text: memoryText,
        memory_type: memoryType,
        memory_category: memoryCategory,
        importance_level: importanceLevel,
        last_interaction_date: new Date().toISOString(),
        source: 'manual',
      };
      if (isEditing) {
        await base44.entities.CharacterMemory.update(memory.id, data);
      } else {
        await base44.entities.CharacterMemory.create({
          ...data,
          strength: 100,
          recall_count: 0,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', characterId] });
      onClose();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] text-white border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Erinnerung bearbeiten' : 'Neue Erinnerung'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-gray-300">Erinnerungstext</Label>
            <Textarea
              value={memoryText}
              onChange={(e) => setMemoryText(e.target.value)}
              placeholder="z.B. Liebt italienisches Essen, hat eine Katze namens Milo..."
              className="bg-[#262626] border-white/10 text-white mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-gray-300">Kategorie</Label>
            <Select value={memoryCategory} onValueChange={setMemoryCategory}>
              <SelectTrigger className="bg-[#262626] border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-white/10">
                {MEMORY_CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Typ</Label>
              <Select value={memoryType} onValueChange={setMemoryType}>
                <SelectTrigger className="bg-[#262626] border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#262626] border-white/10">
                  {MEMORY_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Wichtigkeit</Label>
              <Select value={importanceLevel} onValueChange={setImportanceLevel}>
                <SelectTrigger className="bg-[#262626] border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#262626] border-white/10">
                  <SelectItem value="hoch" className="text-white">🔴 Hoch</SelectItem>
                  <SelectItem value="mittel" className="text-white">🟡 Mittel</SelectItem>
                  <SelectItem value="niedrig" className="text-white">🟢 Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10 text-white">
            Abbrechen
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!memoryText.trim() || saveMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Speichern...</>
            ) : (
              isEditing ? 'Aktualisieren' : 'Speichern'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { MEMORY_TYPES, MEMORY_CATEGORIES };