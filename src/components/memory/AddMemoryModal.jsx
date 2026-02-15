import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

export default function AddMemoryModal({ open, onClose, characterId, userEmail }) {
  const [memoryText, setMemoryText] = useState('');
  const [memoryType, setMemoryType] = useState('fact');
  const [relationType, setRelationType] = useState('Freund');
  const [importanceLevel, setImportanceLevel] = useState('mittel');
  const queryClient = useQueryClient();

  const createMemoryMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CharacterMemory.create({
        character_id: characterId,
        user_email: userEmail,
        memory_text: memoryText,
        memory_type: memoryType,
        relation_type: relationType,
        importance_level: importanceLevel,
        last_interaction_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', characterId] });
      setMemoryText('');
      setMemoryType('fact');
      setRelationType('Freund');
      setImportanceLevel('mittel');
      onClose();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] text-white border-white/10">
        <DialogHeader>
          <DialogTitle>Neue Erinnerung hinzufügen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-gray-300">Erinnerungstext</Label>
            <Textarea
              value={memoryText}
              onChange={(e) => setMemoryText(e.target.value)}
              placeholder="z.B. Liebt italienisches Essen, spielt gerne Gitarre..."
              className="bg-[#262626] border-white/10 text-white mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-gray-300">Beziehungstyp</Label>
            <Select value={relationType} onValueChange={setRelationType}>
              <SelectTrigger className="bg-[#262626] border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-white/10">
                <SelectItem value="Freund" className="text-white">Freund</SelectItem>
                <SelectItem value="Mentor" className="text-white">Mentor</SelectItem>
                <SelectItem value="Kollege" className="text-white">Kollege</SelectItem>
                <SelectItem value="Familie" className="text-white">Familie</SelectItem>
                <SelectItem value="Partner" className="text-white">Partner</SelectItem>
                <SelectItem value="Bekannter" className="text-white">Bekannter</SelectItem>
                <SelectItem value="Andere" className="text-white">Andere</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Art der Erinnerung</Label>
              <Select value={memoryType} onValueChange={setMemoryType}>
                <SelectTrigger className="bg-[#262626] border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#262626] border-white/10">
                  <SelectItem value="fact" className="text-white">Fakt</SelectItem>
                  <SelectItem value="preference" className="text-white">Vorliebe</SelectItem>
                  <SelectItem value="event" className="text-white">Ereignis</SelectItem>
                  <SelectItem value="emotion" className="text-white">Emotion</SelectItem>
                  <SelectItem value="relationship" className="text-white">Beziehung</SelectItem>
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
                  <SelectItem value="hoch" className="text-white">Hoch</SelectItem>
                  <SelectItem value="mittel" className="text-white">Mittel</SelectItem>
                  <SelectItem value="niedrig" className="text-white">Niedrig</SelectItem>
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
            onClick={() => createMemoryMutation.mutate()}
            disabled={!memoryText.trim() || createMemoryMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {createMemoryMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              'Speichern'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}