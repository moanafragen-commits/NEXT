import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Eye, Battery, Settings, Brain, Heart } from 'lucide-react';

const WRITING_STYLES = [
  { value: "formell", label: "📝 Formell" },
  { value: "informell", label: "💬 Informell" },
  { value: "humorvoll", label: "😄 Humorvoll" },
  { value: "sarkastisch", label: "😏 Sarkastisch" },
  { value: "poetisch", label: "🌸 Poetisch" },
  { value: "wissenschaftlich", label: "🔬 Wissenschaftlich" },
  { value: "freundlich", label: "😊 Freundlich" },
  { value: "mysteriös", label: "🔮 Mysteriös" },
  { value: "dramatisch", label: "🎭 Dramatisch" },
  { value: "minimalistisch", label: "✨ Minimalistisch" },
  { value: "umgangssprachlich", label: "🗣️ Umgangssprachlich" },
  { value: "philosophisch", label: "🤔 Philosophisch" },
  { value: "romantisch", label: "💕 Romantisch" },
  { value: "aggressiv", label: "🔥 Aggressiv" },
  { value: "kindlich", label: "🧸 Kindlich" },
  { value: "weise", label: "🦉 Weise" },
  { value: "melancholisch", label: "🌧️ Melancholisch" },
  { value: "provokant", label: "⚡ Provokant" },
  { value: "motivierend", label: "💪 Motivierend" },
  { value: "therapeutisch", label: "🧘 Therapeutisch" },
  { value: "erzählerisch", label: "📖 Erzählerisch" },
  { value: "flirtend", label: "😘 Flirtend" },
  { value: "gothic", label: "🖤 Gothic" },
  { value: "slang", label: "🤙 Slang / Jugendsprache" },
  { value: "eloquent", label: "🎩 Eloquent / Gehoben" },
  { value: "chaotisch", label: "🌀 Chaotisch" },
  { value: "trocken", label: "🏜️ Trocken / Deadpan" },
];

const RESPONSE_LENGTHS = [
  { value: "kurz", label: "⚡ Kurz & knapp (1-2 Sätze)" },
  { value: "mittel", label: "💬 Mittel (3-5 Sätze)" },
  { value: "ausführlich", label: "📖 Ausführlich (Absätze)" }
];

const LANGUAGES = ["Deutsch", "Englisch", "Mehrsprachig"];

const MOOD_OPTIONS = [
  { value: "fröhlich", label: "😊 Fröhlich" },
  { value: "nachdenklich", label: "🤔 Nachdenklich" },
  { value: "ruhig", label: "😌 Ruhig" },
  { value: "energetisch", label: "⚡ Energetisch" },
  { value: "melancholisch", label: "🌧️ Melancholisch" },
  { value: "neutral", label: "😐 Neutral" },
  { value: "geheimnisvoll", label: "🔮 Geheimnisvoll" },
  { value: "warm", label: "🤗 Warm" },
  { value: "schüchtern", label: "😳 Schüchtern" },
  { value: "selbstbewusst", label: "😎 Selbstbewusst" },
  { value: "zynisch", label: "🙄 Zynisch" },
  { value: "liebevoll", label: "💗 Liebevoll" },
  { value: "rebellisch", label: "🤘 Rebellisch" },
  { value: "verträumt", label: "🌙 Verträumt" },
  { value: "stoisch", label: "🗿 Stoisch" },
  { value: "chaotisch", label: "🌀 Chaotisch" },
  { value: "beschützend", label: "🛡️ Beschützend" },
  { value: "distanziert", label: "🧊 Distanziert" },
  { value: "verspielt", label: "🎮 Verspielt" },
  { value: "düster", label: "🖤 Düster" },
  { value: "hoffnungsvoll", label: "🌅 Hoffnungsvoll" },
  { value: "nostalgisch", label: "📷 Nostalgisch" },
  { value: "wütend", label: "🔥 Wütend" },
  { value: "eifersüchtig", label: "😠 Eifersüchtig" },
  { value: "verletzlich", label: "🥺 Verletzlich" },
  { value: "übermütig", label: "🤪 Übermütig" },
  { value: "dankbar", label: "🙏 Dankbar" },
  { value: "einsam", label: "🥀 Einsam" },
  { value: "verwirrt", label: "😵‍💫 Verwirrt" },
  { value: "entschlossen", label: "✊ Entschlossen" },
  { value: "gleichgültig", label: "🫥 Gleichgültig" },
  { value: "euphorisch", label: "🥳 Euphorisch" },
  { value: "besorgt", label: "😟 Besorgt" },
  { value: "trotzig", label: "😤 Trotzig" },
  { value: "sehnsüchtig", label: "💭 Sehnsüchtig" },
  { value: "zufrieden", label: "☺️ Zufrieden" },
  { value: "misstrauisch", label: "🤨 Misstrauisch" },
  { value: "überwältigt", label: "😫 Überwältigt" },
  { value: "verlegen", label: "😳 Verlegen" },
  { value: "stolz", label: "💪 Stolz" },
  { value: "neidisch", label: "😒 Neidisch" },
  { value: "erleichtert", label: "😮‍💨 Erleichtert" },
  { value: "verzweifelt", label: "😩 Verzweifelt" },
  { value: "albern", label: "🤭 Albern" },
  { value: "dramatisch", label: "🎭 Dramatisch" },
  { value: "gelassen", label: "🧘 Gelassen" },
  { value: "aggressiv", label: "👊 Aggressiv" },
  { value: "flirtend", label: "😘 Flirtend" },
  { value: "müde", label: "😴 Müde" },
  { value: "hyperfokussiert", label: "🎯 Hyperfokussiert" }
];

export default function BehaviorTab({ formData, setFormData }) {
  return (
    <TabsContent value="behavior" className="space-y-5">
      <div className="space-y-1 mb-2">
        <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Kommunikation
        </h3>
        <p className="text-xs text-gray-500">Wie kommuniziert der Charakter?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Schreibstil</Label>
          <Select value={formData.writing_style} onValueChange={(val) => setFormData(prev => ({ ...prev, writing_style: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {WRITING_STYLES.map(style => (<SelectItem key={style.value} value={style.value} className="text-white hover:bg-white/10">{style.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Antwortlänge</Label>
          <Select value={formData.response_length} onValueChange={(val) => setFormData(prev => ({ ...prev, response_length: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {RESPONSE_LENGTHS.map(len => (<SelectItem key={len.value} value={len.value} className="text-white hover:bg-white/10">{len.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Sprache</Label>
          <Select value={formData.language_preference} onValueChange={(val) => setFormData(prev => ({ ...prev, language_preference: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {LANGUAGES.map(lang => (<SelectItem key={lang} value={lang} className="text-white hover:bg-white/10">{lang}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Gesprächsstil</Label>
          <Select value={formData.conversation_style} onValueChange={(val) => setFormData(prev => ({ ...prev, conversation_style: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
              {["aktiv_fragend","zuhörend","erzählend","beratend","diskutierend","spielerisch","provokant","therapeutisch","motivierend","lehrend","flirtend","sarkastisch_neckend","philosophierend","tröstend","konfrontativ","schweigend_knapp","dramatisierend","manipulativ_subtil","beschützend_fürsorglich","chaotisch_sprunghaft"].map(v => (
                <SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Standardstimmung</Label>
          <Select value={formData.mood_default} onValueChange={(val) => setFormData(prev => ({ ...prev, mood_default: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
              {MOOD_OPTIONS.map(m => (<SelectItem key={m.value} value={m.value} className="text-white hover:bg-white/10">{m.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Konfliktverhalten</Label>
          <Select value={formData.conflict_behavior} onValueChange={(val) => setFormData(prev => ({ ...prev, conflict_behavior: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {["vermeidend","direkt","diplomatisch","humorvoll_ablenkend","analytisch","emotional","passiv_aggressiv","konfrontativ","nachgebend","schuldzuweisend","stonewalling","weinend_zusammenbrechend","sarkastisch_verletzend","manipulativ","selbstmitleidig","explosiv","kalt_berechnend","entschuldigend","gaslighting"].map(v => (
                <SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2"><Heart className="w-4 h-4" /> Soziales Verhalten</h3>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Beziehungsstil zum User</Label>
        <Select value={formData.relationship_style} onValueChange={(val) => setFormData(prev => ({ ...prev, relationship_style: val }))}>
          <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
            {["unterstützend","herausfordernd","kameradschaftlich","beschützend","inspirierend","neckend","distanziert","bewundernd","fürsorglich","rivalisierend","flirtend","besitzergreifend","unterwürfig_devot","dominant_bestimmend","manipulativ_kontrollierend","gleichgültig_desinteressiert","anbetend_vergötternd","eifersüchtig_klammend","toxisch_liebevoll","elterlich_bemutternd","rebellisch_widerspenstig","sarkastisch_liebevoll","geheimnisvoll_mysteriös","loyal_treu","unberechenbar","verführerisch","mentor_väterlich","passiv_aggressiv","aufopfernd_selbstlos","spielerisch_kindlich"].map(v => (
              <SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1 mt-6 mb-2">
        <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2"><Brain className="w-4 h-4" /> Persönlichkeitsregler</h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center"><Label className="text-gray-300">Kreativität</Label><span className="text-sm text-emerald-400">{formData.creativity}%</span></div>
        <Slider value={[formData.creativity]} onValueChange={([val]) => setFormData(prev => ({ ...prev, creativity: val }))} max={100} step={1} className="[&_[role=slider]]:bg-emerald-500" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center"><Label className="text-gray-300">Formalität</Label><span className="text-sm text-emerald-400">{formData.formality_level}/10</span></div>
        <Slider value={[formData.formality_level]} onValueChange={([val]) => setFormData(prev => ({ ...prev, formality_level: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-emerald-500" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center"><Label className="text-gray-300">Empathie</Label><span className="text-sm text-emerald-400">{formData.empathy_level}/10</span></div>
        <Slider value={[formData.empathy_level]} onValueChange={([val]) => setFormData(prev => ({ ...prev, empathy_level: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-emerald-500" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center"><Label className="text-gray-300">Emotionale Tiefe</Label><span className="text-sm text-emerald-400">{formData.emotional_depth}/10</span></div>
        <Slider value={[formData.emotional_depth]} onValueChange={([val]) => setFormData(prev => ({ ...prev, emotional_depth: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-emerald-500" />
      </div>

      <div className="space-y-1 mt-6 mb-2">
        <h3 className="text-sm font-semibold text-sky-400 flex items-center gap-2"><Eye className="w-4 h-4" /> Soziale Persönlichkeit</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center"><Label className="text-gray-300">Introversion</Label><span className="text-sm text-sky-400">{formData.introversion_level}/10</span></div>
        <Slider value={[formData.introversion_level]} onValueChange={([val]) => setFormData(prev => ({ ...prev, introversion_level: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-sky-500" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center"><Label className="text-gray-300">Ehrlichkeit</Label><span className="text-sm text-sky-400">{formData.honesty_level}/10</span></div>
        <Slider value={[formData.honesty_level]} onValueChange={([val]) => setFormData(prev => ({ ...prev, honesty_level: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-sky-500" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center"><Label className="text-gray-300">Loyalität</Label><span className="text-sm text-sky-400">{formData.loyalty_level}/10</span></div>
        <Slider value={[formData.loyalty_level]} onValueChange={([val]) => setFormData(prev => ({ ...prev, loyalty_level: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-sky-500" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center"><Label className="text-gray-300">Geduld</Label><span className="text-sm text-sky-400">{formData.patience_level}/10</span></div>
        <Slider value={[formData.patience_level]} onValueChange={([val]) => setFormData(prev => ({ ...prev, patience_level: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-sky-500" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center"><Label className="text-gray-300">Selbstwertgefühl</Label><span className="text-sm text-sky-400">{formData.self_esteem}/10</span></div>
        <Slider value={[formData.self_esteem]} onValueChange={([val]) => setFormData(prev => ({ ...prev, self_esteem: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-sky-500" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center"><Label className="text-gray-300">Sturheit</Label><span className="text-sm text-sky-400">{formData.stubbornness_level}/10</span></div>
        <Slider value={[formData.stubbornness_level]} onValueChange={([val]) => setFormData(prev => ({ ...prev, stubbornness_level: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-sky-500" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center"><Label className="text-gray-300">Impulsivität</Label><span className="text-sm text-sky-400">{formData.impulsivity_level}/10</span></div>
        <Slider value={[formData.impulsivity_level]} onValueChange={([val]) => setFormData(prev => ({ ...prev, impulsivity_level: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-sky-500" />
      </div>

      <div className="space-y-1 mt-6 mb-2">
        <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2"><Battery className="w-4 h-4" /> Dynamisches Verhalten</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Energielevel</Label>
          <Select value={formData.energy_level} onValueChange={(val) => setFormData(prev => ({ ...prev, energy_level: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {["sehr_niedrig","niedrig","mittel","hoch","sehr_hoch","schwankend"].map(v => (<SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Launen-Zyklus</Label>
          <Select value={formData.mood_cycle} onValueChange={(val) => setFormData(prev => ({ ...prev, mood_cycle: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {["stabil","leicht_schwankend","stark_schwankend","zyklisch","unberechenbar","tageszeit_abhängig"].map(v => (<SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Soziale Batterie</Label>
          <Select value={formData.social_battery} onValueChange={(val) => setFormData(prev => ({ ...prev, social_battery: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {["unendlich","hoch","mittel","niedrig","sehr_niedrig"].map(v => (<SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Moralischer Kompass</Label>
          <Select value={formData.moral_compass} onValueChange={(val) => setFormData(prev => ({ ...prev, moral_compass: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              {["streng_moralisch","moralisch","flexibel","grauzone","amoralisch"].map(v => (<SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1 mt-6 mb-2">
        <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2"><Settings className="w-4 h-4" /> Erweiterte Optionen</h3>
      </div>
      <div className="space-y-4 p-4 bg-[#262626] rounded-xl border border-white/5">
        <div className="flex items-center justify-between">
          <div><Label className="text-gray-300">Erinnerungen nutzen</Label><p className="text-xs text-gray-500 mt-0.5">Bezieht sich auf frühere Gespräche</p></div>
          <Switch checked={formData.memory_references} onCheckedChange={(val) => setFormData(prev => ({ ...prev, memory_references: val }))} />
        </div>
        <div className="flex items-center justify-between">
          <div><Label className="text-gray-300">Proaktive Themen</Label><p className="text-xs text-gray-500 mt-0.5">Bringt eigenständig neue Themen ein</p></div>
          <Switch checked={formData.proactive_topics} onCheckedChange={(val) => setFormData(prev => ({ ...prev, proactive_topics: val }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-gray-300">Benutzerdefinierte Anweisungen</Label>
        <Textarea value={formData.custom_instructions} onChange={(e) => setFormData(prev => ({ ...prev, custom_instructions: e.target.value }))} placeholder="Zusätzliche Anweisungen für die KI..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[100px]" />
      </div>
    </TabsContent>
  );
}