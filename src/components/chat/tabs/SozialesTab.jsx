import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Smartphone } from 'lucide-react';

export default function SozialesTab({ formData, setFormData }) {
  const u = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
        <p className="text-xs text-cyan-300">👥 Social-Media-Verhalten, Freundeskreis und wie der Charakter in der Gesellschaft agiert.</p>
      </div>

      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
          <Users className="w-4 h-4" /> Soziales Umfeld
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Familienstand</Label>
          <Select value={formData.family_status || ''} onValueChange={val => u('family_status', val)}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {[{v:"ledig",l:"💚 Ledig"},{v:"in_beziehung",l:"💑 In Beziehung"},{v:"verlobt",l:"💍 Verlobt"},{v:"verheiratet",l:"💒 Verheiratet"},{v:"geschieden",l:"📋 Geschieden"},{v:"verwitwet",l:"🖤 Verwitwet"},{v:"kompliziert",l:"🔀 Kompliziert"}].map(o => (
                <SelectItem key={o.v} value={o.v} className="text-white hover:bg-white/10">{o.l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-white">Bildung</Label>
          <Input value={formData.education || ''} onChange={e => u('education', e.target.value)} placeholder="z.B. Studium Psychologie, Ausbildung..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Kinder</Label>
          <Input value={formData.children || ''} onChange={e => u('children', e.target.value)} placeholder="z.B. 1 Tochter (5)" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Haustiere</Label>
          <Input value={formData.pets || ''} onChange={e => u('pets', e.target.value)} placeholder="z.B. Katze Luna" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Substanzkonsum</Label>
        <Input value={formData.substance_use || ''} onChange={e => u('substance_use', e.target.value)} placeholder="z.B. Trinkt sozial, raucht nicht..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
      </div>

      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
          <Smartphone className="w-4 h-4" /> Online-Verhalten
        </h3>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Social-Media-Verhalten</Label>
        <Textarea value={formData.social_media_behavior || ''} onChange={e => u('social_media_behavior', e.target.value)} placeholder="z.B. Instagram-süchtig, postet Memes, lurkt nur, kein Social Media..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
      </div>
    </div>
  );
}