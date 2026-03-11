import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Palette } from 'lucide-react';

export default function AppearanceTab({ formData, setFormData }) {
  return (
    <TabsContent value="appearance" className="space-y-5">
      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-xs text-purple-300">👁️ Beschreibe das Aussehen deines Charakters – macht intime Szenen und Beschreibungen lebendiger.</p>
      </div>

      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
          <User className="w-4 h-4" />
          Körper & Erscheinung
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Größe</Label>
          <Input value={formData.height} onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))} placeholder="z.B. 175cm" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Körperbau</Label>
          <Select value={formData.body_type} onValueChange={(val) => setFormData(prev => ({ ...prev, body_type: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {["schlank","sportlich","durchschnittlich","kräftig","kurvig","muskulös","zierlich","füllig","dünn","breit"].map(v => (
                <SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v.charAt(0).toUpperCase()+v.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Fitness</Label>
          <Select value={formData.physical_fitness} onValueChange={(val) => setFormData(prev => ({ ...prev, physical_fitness: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {[{v:"unsportlich",l:"🛋️ Unsportlich"},{v:"leicht_aktiv",l:"🚶 Leicht aktiv"},{v:"durchschnittlich",l:"🙂 Durchschnittlich"},{v:"sportlich",l:"🏃 Sportlich"},{v:"sehr_sportlich",l:"💪 Sehr sportlich"},{v:"athletisch",l:"🏋️ Athletisch"}].map(o => (
                <SelectItem key={o.v} value={o.v} className="text-white hover:bg-white/10">{o.l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Haarfarbe</Label>
          <Input value={formData.hair_color} onChange={(e) => setFormData(prev => ({ ...prev, hair_color: e.target.value }))} placeholder="z.B. Dunkelbraun" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Frisur</Label>
          <Input value={formData.hair_style} onChange={(e) => setFormData(prev => ({ ...prev, hair_style: e.target.value }))} placeholder="z.B. Lockig, schulterlang" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Augenfarbe</Label>
          <Input value={formData.eye_color} onChange={(e) => setFormData(prev => ({ ...prev, eye_color: e.target.value }))} placeholder="z.B. Grün" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Hautton</Label>
          <Input value={formData.skin_tone} onChange={(e) => setFormData(prev => ({ ...prev, skin_tone: e.target.value }))} placeholder="z.B. Oliv" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Tattoos & Piercings</Label>
        <Textarea value={formData.tattoos_piercings} onChange={(e) => setFormData(prev => ({ ...prev, tattoos_piercings: e.target.value }))} placeholder="z.B. Sleeve am linken Arm, Nasenpiercing, Bauchnabelpiercing..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Narben & Merkmale</Label>
          <Textarea value={formData.scars_marks} onChange={(e) => setFormData(prev => ({ ...prev, scars_marks: e.target.value }))} placeholder="z.B. Narbe über Augenbraue, Muttermal am Hals..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Auffällige Merkmale</Label>
          <Textarea value={formData.distinctive_features} onChange={(e) => setFormData(prev => ({ ...prev, distinctive_features: e.target.value }))} placeholder="z.B. Sommersprossen, Grübchen, markantes Kinn..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
      </div>

      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Stil & Ausstrahlung
        </h3>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Kleidungsstil</Label>
        <Input value={formData.clothing_style} onChange={(e) => setFormData(prev => ({ ...prev, clothing_style: e.target.value }))} placeholder="z.B. Streetwear, elegant, gothic, casual, sportlich..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Stimme</Label>
          <Input value={formData.voice_description} onChange={(e) => setFormData(prev => ({ ...prev, voice_description: e.target.value }))} placeholder="z.B. Tief, rau, samtig, melodisch..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Typischer Duft</Label>
          <Input value={formData.scent} onChange={(e) => setFormData(prev => ({ ...prev, scent: e.target.value }))} placeholder="z.B. Holzig-warm, Vanille, Zigaretten..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
          <User className="w-4 h-4" />
          Persönlichkeitstypen
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">MBTI</Label>
          <Select value={formData.mbti_type} onValueChange={(val) => setFormData(prev => ({ ...prev, mbti_type: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
              {["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"].map(v => (
                <SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Sternzeichen</Label>
          <Select value={formData.zodiac_sign} onValueChange={(val) => setFormData(prev => ({ ...prev, zodiac_sign: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
              {[{v:"Widder",e:"♈"},{v:"Stier",e:"♉"},{v:"Zwillinge",e:"♊"},{v:"Krebs",e:"♋"},{v:"Löwe",e:"♌"},{v:"Jungfrau",e:"♍"},{v:"Waage",e:"♎"},{v:"Skorpion",e:"♏"},{v:"Schütze",e:"♐"},{v:"Steinbock",e:"♑"},{v:"Wassermann",e:"♒"},{v:"Fische",e:"♓"}].map(o => (
                <SelectItem key={o.v} value={o.v} className="text-white hover:bg-white/10">{o.e} {o.v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Enneagramm</Label>
          <Select value={formData.enneagram_type} onValueChange={(val) => setFormData(prev => ({ ...prev, enneagram_type: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
              {["1 - Reformer","2 - Helfer","3 - Macher","4 - Individualist","5 - Forscher","6 - Loyaler","7 - Enthusiast","8 - Herausforderer","9 - Friedensstifter"].map(v => (
                <SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
          <User className="w-4 h-4" />
          Soziales & Hintergrund
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Gesprochene Sprachen</Label>
          <Input value={formData.languages_spoken} onChange={(e) => setFormData(prev => ({ ...prev, languages_spoken: e.target.value }))} placeholder="Deutsch, Englisch, Spanisch..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Akzent/Dialekt</Label>
          <Input value={formData.accent_dialect} onChange={(e) => setFormData(prev => ({ ...prev, accent_dialect: e.target.value }))} placeholder="z.B. Bayerisch, Berlinerisch..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Bildung</Label>
          <Input value={formData.education} onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))} placeholder="z.B. Studium Psychologie, Ausbildung..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Wohnsituation</Label>
          <Input value={formData.living_situation} onChange={(e) => setFormData(prev => ({ ...prev, living_situation: e.target.value }))} placeholder="z.B. Allein in Hamburg, WG..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Familienstand</Label>
          <Select value={formData.family_status} onValueChange={(val) => setFormData(prev => ({ ...prev, family_status: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {[{v:"ledig",l:"💚 Ledig"},{v:"in_beziehung",l:"💑 In Beziehung"},{v:"verlobt",l:"💍 Verlobt"},{v:"verheiratet",l:"💒 Verheiratet"},{v:"geschieden",l:"📋 Geschieden"},{v:"verwitwet",l:"🖤 Verwitwet"},{v:"kompliziert",l:"🔀 Kompliziert"}].map(o => (
                <SelectItem key={o.v} value={o.v} className="text-white hover:bg-white/10">{o.l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Kinder</Label>
          <Input value={formData.children} onChange={(e) => setFormData(prev => ({ ...prev, children: e.target.value }))} placeholder="z.B. 1 Tochter (5)" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Haustiere</Label>
          <Input value={formData.pets} onChange={(e) => setFormData(prev => ({ ...prev, pets: e.target.value }))} placeholder="z.B. Katze Luna" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Religion/Spiritualität</Label>
          <Input value={formData.religion_spirituality} onChange={(e) => setFormData(prev => ({ ...prev, religion_spirituality: e.target.value }))} placeholder="z.B. Atheist, spirituell, Buddhist..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Politische Einstellung</Label>
          <Input value={formData.political_stance} onChange={(e) => setFormData(prev => ({ ...prev, political_stance: e.target.value }))} placeholder="z.B. liberal, konservativ..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Substanzkonsum</Label>
          <Input value={formData.substance_use} onChange={(e) => setFormData(prev => ({ ...prev, substance_use: e.target.value }))} placeholder="z.B. Trinkt sozial, raucht nicht..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Social-Media-Verhalten</Label>
          <Input value={formData.social_media_behavior} onChange={(e) => setFormData(prev => ({ ...prev, social_media_behavior: e.target.value }))} placeholder="z.B. Instagram-süchtig, kein Social Media..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>
    </TabsContent>
  );
}