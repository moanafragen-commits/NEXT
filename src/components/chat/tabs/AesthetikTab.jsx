import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Palette } from 'lucide-react';

export default function AesthetikTab({ formData, setFormData }) {
  const u = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
        <p className="text-xs text-pink-300">✨ Die visuelle Ästhetik deines Charakters – Kleidungsstil, Farbpalette und Ausstrahlung.</p>
      </div>

      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-2">
          <Palette className="w-4 h-4" /> Stil & Ästhetik
        </h3>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Kleidungsstil</Label>
        <Input value={formData.clothing_style || ''} onChange={e => u('clothing_style', e.target.value)} placeholder="z.B. Streetwear, elegant, gothic, casual..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Typischer Duft</Label>
          <Input value={formData.scent || ''} onChange={e => u('scent', e.target.value)} placeholder="z.B. Holzig-warm, Vanille..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Stimme</Label>
          <Input value={formData.voice_description || ''} onChange={e => u('voice_description', e.target.value)} placeholder="z.B. Tief, rau, samtig..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>
    </div>
  );
}