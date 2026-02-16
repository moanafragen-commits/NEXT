import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Languages } from 'lucide-react';

export default function SpracheTab({ formData, setFormData }) {
  const u = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-300">💬 Sprache definiert, wie dein Charakter klingt – Dialekte, Slang, Sprachmuster und besondere Ausdrücke.</p>
      </div>

      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
          <Languages className="w-4 h-4" /> Sprachen & Dialekt
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Gesprochene Sprachen</Label>
          <Input value={formData.languages_spoken || ''} onChange={e => u('languages_spoken', e.target.value)} placeholder="Deutsch, Englisch, Spanisch..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Akzent / Dialekt</Label>
          <Input value={formData.accent_dialect || ''} onChange={e => u('accent_dialect', e.target.value)} placeholder="z.B. Bayerisch, Berlinerisch..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Sprachstil
        </h3>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Sprachliche Eigenheiten</Label>
        <Textarea value={formData.speech_patterns || ''} onChange={e => u('speech_patterns', e.target.value)} placeholder="z.B. Verwendet oft 'Alter', spricht im Dialekt, benutzt Fachbegriffe..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Wiederkehrende Sprüche</Label>
        <Input value={formData.catchphrases || ''} onChange={e => u('catchphrases', e.target.value)} placeholder="z.B. 'Das ist der Weg!', 'Nicht schlecht, Herr Specht'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Beispiel-Dialoge</Label>
        <Textarea value={formData.example_dialogues || ''} onChange={e => u('example_dialogues', e.target.value)} placeholder={"User: Wie geht es dir?\nCharakter: Ach, du weißt ja, immer am hustlen! 😎"} className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[100px] font-mono text-xs" />
        <p className="text-xs text-gray-500">Hilft der KI, den Ton und Stil besser zu treffen.</p>
      </div>
    </div>
  );
}