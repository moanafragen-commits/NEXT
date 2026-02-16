import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Heart, Shield } from 'lucide-react';

export default function PsycheTab({ formData, setFormData }) {
  const u = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-xs text-purple-300">🧠 Die Psyche macht deinen Charakter tiefgründig – Ängste, Trigger, Coping-Mechanismen und innere Konflikte.</p>
      </div>

      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
          <Brain className="w-4 h-4" /> Innere Welt
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Phobien</Label>
          <Textarea value={formData.phobias || ''} onChange={e => u('phobias', e.target.value)} placeholder="Spinnen, Höhe, enge Räume..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Nervöse Ticks</Label>
          <Textarea value={formData.nervous_ticks || ''} onChange={e => u('nervous_ticks', e.target.value)} placeholder="Nägelkauen, Haare zwirbeln..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Emotionale Trigger</Label>
          <Textarea value={formData.triggers || ''} onChange={e => u('triggers', e.target.value)} placeholder="Verlustangst, Ungerechtigkeit..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Bewältigungsstrategien</Label>
          <Textarea value={formData.coping_mechanisms || ''} onChange={e => u('coping_mechanisms', e.target.value)} placeholder="Sport, Rückzug, Humor..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
      </div>

      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Psychische Stabilität
        </h3>
      </div>

      <div className="space-y-4 p-4 bg-[#262626] rounded-xl border border-white/5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-white">Selbstwertgefühl</Label>
            <span className="text-sm text-purple-400">{formData.self_esteem}/10</span>
          </div>
          <Slider value={[formData.self_esteem]} onValueChange={([val]) => u('self_esteem', val)} min={1} max={10} step={1} className="[&_[role=slider]]:bg-purple-500" />
          <p className="text-xs text-gray-500">1 = extrem unsicher • 10 = narzisstisch</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-white">Impulsivität</Label>
            <span className="text-sm text-purple-400">{formData.impulsivity_level}/10</span>
          </div>
          <Slider value={[formData.impulsivity_level]} onValueChange={([val]) => u('impulsivity_level', val)} min={1} max={10} step={1} className="[&_[role=slider]]:bg-purple-500" />
          <p className="text-xs text-gray-500">1 = sehr überlegt • 10 = extrem impulsiv</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Stressreaktion</Label>
          <Select value={formData.stress_response} onValueChange={val => u('stress_response', val)}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              <SelectItem value="fight" className="text-white hover:bg-white/10">⚔️ Fight</SelectItem>
              <SelectItem value="flight" className="text-white hover:bg-white/10">🏃 Flight</SelectItem>
              <SelectItem value="freeze" className="text-white hover:bg-white/10">🧊 Freeze</SelectItem>
              <SelectItem value="fawn" className="text-white hover:bg-white/10">🙇 Fawn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-white">Moralischer Kompass</Label>
          <Select value={formData.moral_compass} onValueChange={val => u('moral_compass', val)}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              <SelectItem value="streng_moralisch" className="text-white hover:bg-white/10">😇 Streng moralisch</SelectItem>
              <SelectItem value="moralisch" className="text-white hover:bg-white/10">👍 Moralisch</SelectItem>
              <SelectItem value="flexibel" className="text-white hover:bg-white/10">🤷 Flexibel</SelectItem>
              <SelectItem value="grauzone" className="text-white hover:bg-white/10">🌫️ Grauzone</SelectItem>
              <SelectItem value="amoralisch" className="text-white hover:bg-white/10">😈 Amoralisch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Süchte & Abhängigkeiten</Label>
        <Textarea value={formData.addictions || ''} onChange={e => u('addictions', e.target.value)} placeholder="Alkohol, Nikotin, Social Media, Gaming..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
      </div>
    </div>
  );
}