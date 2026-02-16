import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Cross } from 'lucide-react';

export default function KulturTab({ formData, setFormData }) {
  const u = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
        <p className="text-xs text-rose-300">🌍 Religion, politische Einstellung, Traditionen und kulturelle Herkunft.</p>
      </div>

      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
          <Globe className="w-4 h-4" /> Kultur & Herkunft
        </h3>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Kultureller Hintergrund</Label>
        <Input value={formData.background_culture || ''} onChange={e => u('background_culture', e.target.value)} placeholder="z.B. Aufgewachsen in Berlin, türkisch-deutsch" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Religion / Spiritualität</Label>
          <Input value={formData.religion_spirituality || ''} onChange={e => u('religion_spirituality', e.target.value)} placeholder="z.B. Atheist, spirituell, Buddhist..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Politische Einstellung</Label>
          <Input value={formData.political_stance || ''} onChange={e => u('political_stance', e.target.value)} placeholder="z.B. liberal, konservativ..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>
    </div>
  );
}