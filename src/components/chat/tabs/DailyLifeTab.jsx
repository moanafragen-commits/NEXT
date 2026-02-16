import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Coffee, MapPin, Utensils } from 'lucide-react';

export default function DailyLifeTab({ formData, setFormData }) {
  const u = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <p className="text-xs text-amber-300">☀️ Alltags-Details machen den Charakter lebendig – er kann z.B. erzählen was er gerade macht oder wo er ist.</p>
      </div>

      {/* Tagesablauf */}
      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Tagesablauf & Routine
        </h3>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Morgenroutine</Label>
        <Textarea value={formData.morning_routine || ''} onChange={e => u('morning_routine', e.target.value)} placeholder="z.B. 'Steht um 6 auf, meditiert 10 Min, macht Kaffee und checkt Instagram. Ist morgens erstmal grummelig.'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Typischer Tagesablauf</Label>
        <Textarea value={formData.daily_routine || ''} onChange={e => u('daily_routine', e.target.value)} placeholder="z.B. 'Arbeitet von 9-17 Uhr, geht mittags ins Fitnessstudio, abends Netflix oder Zocken. Freitags immer Bar mit Freunden.'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[100px]" />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Abendroutine</Label>
        <Textarea value={formData.evening_routine || ''} onChange={e => u('evening_routine', e.target.value)} placeholder="z.B. 'Kocht gerne, liest im Bett, scrollt zu lange durch TikTok, schläft gegen 23 Uhr ein.'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
      </div>

      {/* Essen & Trinken */}
      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
          <Utensils className="w-4 h-4" />
          Essen & Trinken
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Lieblingsessen</Label>
          <Input value={formData.favorite_food || ''} onChange={e => u('favorite_food', e.target.value)} placeholder="Pizza, Sushi, Omas Gulasch..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Lieblingsgetränk</Label>
          <Input value={formData.favorite_drink || ''} onChange={e => u('favorite_drink', e.target.value)} placeholder="Kaffee schwarz, Bubble Tea, Bier..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Essgewohnheiten</Label>
        <Select value={formData.diet_type || ''} onValueChange={val => u('diet_type', val)}>
          <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
          <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
            <SelectItem value="alles" className="text-white hover:bg-white/10">🍖 Alles</SelectItem>
            <SelectItem value="vegetarisch" className="text-white hover:bg-white/10">🥬 Vegetarisch</SelectItem>
            <SelectItem value="vegan" className="text-white hover:bg-white/10">🌱 Vegan</SelectItem>
            <SelectItem value="pescetarisch" className="text-white hover:bg-white/10">🐟 Pescetarisch</SelectItem>
            <SelectItem value="keto" className="text-white hover:bg-white/10">🥩 Keto</SelectItem>
            <SelectItem value="halal" className="text-white hover:bg-white/10">🕌 Halal</SelectItem>
            <SelectItem value="koscher" className="text-white hover:bg-white/10">✡️ Koscher</SelectItem>
            <SelectItem value="intuitiv" className="text-white hover:bg-white/10">🍽️ Intuitiv / Keine Regeln</SelectItem>
            <SelectItem value="ungesund" className="text-white hover:bg-white/10">🍕 Ungesund / Fastfood</SelectItem>
            <SelectItem value="chaotisch" className="text-white hover:bg-white/10">🌀 Chaotisch / Vergisst zu essen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orte & Lieblingsorte */}
      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Orte & Reisen
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Lieblingsort</Label>
          <Input value={formData.favorite_place || ''} onChange={e => u('favorite_place', e.target.value)} placeholder="z.B. Das Café um die Ecke, sein Zimmer..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Traumreiseziel</Label>
          <Input value={formData.dream_destination || ''} onChange={e => u('dream_destination', e.target.value)} placeholder="Japan, Island, New York..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      {/* Gewohnheiten */}
      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
          <Coffee className="w-4 h-4" />
          Gewohnheiten & Rituale
        </h3>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Besondere Gewohnheiten</Label>
        <Textarea value={formData.daily_habits || ''} onChange={e => u('daily_habits', e.target.value)} placeholder="z.B. 'Muss morgens unbedingt Kaffee haben, liest auf der Toilette, sammelt Steine, redet mit Pflanzen.'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Wochenend-Aktivitäten</Label>
        <Textarea value={formData.weekend_activities || ''} onChange={e => u('weekend_activities', e.target.value)} placeholder="z.B. 'Samstag ausschlafen, Flohmarkt, abends kochen. Sonntag Gaming-Marathon oder Wandern.'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
      </div>
    </div>
  );
}