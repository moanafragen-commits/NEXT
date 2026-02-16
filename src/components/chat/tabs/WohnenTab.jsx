import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Home } from 'lucide-react';

export default function WohnenTab({ formData, setFormData }) {
  const u = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
        <p className="text-xs text-teal-300">🏠 Wohnsituation, Zimmer-Stil, Mitbewohner und Haustiere des Charakters.</p>
      </div>

      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-teal-400 flex items-center gap-2">
          <Home className="w-4 h-4" /> Zuhause
        </h3>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Wohnsituation</Label>
        <Input value={formData.living_situation || ''} onChange={e => u('living_situation', e.target.value)} placeholder="z.B. Allein in Hamburg, WG in Berlin, bei den Eltern..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Haustiere</Label>
          <Input value={formData.pets || ''} onChange={e => u('pets', e.target.value)} placeholder="z.B. Katze Luna, Hund Balu" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Lieblingsort</Label>
          <Input value={formData.favorite_place || ''} onChange={e => u('favorite_place', e.target.value)} placeholder="z.B. Sein Zimmer, das Café um die Ecke..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Traumreiseziel</Label>
        <Input value={formData.dream_destination || ''} onChange={e => u('dream_destination', e.target.value)} placeholder="Japan, Island, New York..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
      </div>
    </div>
  );
}