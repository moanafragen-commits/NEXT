import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Theater } from 'lucide-react';

export default function MaskenTab({ formData, setFormData }) {
  const u = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
        <p className="text-xs text-indigo-300">🎭 Wie gibt sich der Charakter nach außen vs. wie er wirklich ist – die Maske und das wahre Ich.</p>
      </div>

      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
          <Eye className="w-4 h-4" /> Selbst- & Fremdbild
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Selbstbild (wie er sich sieht)</Label>
          <Textarea value={formData.self_image || ''} onChange={e => u('self_image', e.target.value)} placeholder="z.B. 'Hält sich für wertlos trotz Erfolg'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[100px]" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Fremdbild (wie andere ihn sehen)</Label>
          <Textarea value={formData.external_image || ''} onChange={e => u('external_image', e.target.value)} placeholder="z.B. 'Wirkt nach außen selbstbewusst und stark'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[100px]" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Körperbild</Label>
        <Textarea value={formData.body_image || ''} onChange={e => u('body_image', e.target.value)} placeholder="z.B. Body Dysmorphie, Unsicherheit über bestimmte Körperteile, Komfort mit dem Körper..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Geheimnis (wird langsam enthüllt)</Label>
        <Textarea value={formData.secret || ''} onChange={e => u('secret', e.target.value)} placeholder="z.B. 'War früher ein berühmter Musiker, hat aber aufgehört nach einem Vorfall...'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
        <p className="text-xs text-gray-500">Das Geheimnis wird im Laufe der Gespräche nach und nach preisgegeben.</p>
      </div>
    </div>
  );
}