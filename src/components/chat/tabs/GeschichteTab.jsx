import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, HeartCrack } from 'lucide-react';

export default function GeschichteTab({ formData, setFormData }) {
  const u = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <p className="text-xs text-orange-300">📜 Kindheit, prägende Erlebnisse, Trauma und die Vergangenheit des Charakters.</p>
      </div>

      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Vergangenheit
        </h3>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Trauma & prägende Erlebnisse</Label>
        <Textarea value={formData.trauma || ''} onChange={e => u('trauma', e.target.value)} placeholder="z.B. Verlust eines Elternteils, Mobbing, schwerer Unfall..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[100px]" />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Psychische Erkrankungen</Label>
        <Textarea value={formData.mental_health || ''} onChange={e => u('mental_health', e.target.value)} placeholder="z.B. Depression, Angststörung, ADHS, PTBS..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
      </div>

      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
          <HeartCrack className="w-4 h-4" /> Behandlung & Genesung
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Medikamente</Label>
          <Textarea value={formData.medications || ''} onChange={e => u('medications', e.target.value)} placeholder="z.B. Antidepressiva, Ritalin..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Therapeut/in</Label>
          <Textarea value={formData.therapist_info || ''} onChange={e => u('therapist_info', e.target.value)} placeholder="z.B. Verhaltenstherapie bei Dr. Müller..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Klinikaufenthalte</Label>
        <Textarea value={formData.clinic_stays || ''} onChange={e => u('clinic_stays', e.target.value)} placeholder="z.B. 3 Monate psychiatrische Klinik wegen Burnout..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Diagnose-Zeitpunkt</Label>
          <Select value={formData.diagnosis_age || ''} onValueChange={val => u('diagnosis_age', val)}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              <SelectItem value="kindheit" className="text-white hover:bg-white/10">👶 Kindheit</SelectItem>
              <SelectItem value="jugend" className="text-white hover:bg-white/10">🧑 Jugend</SelectItem>
              <SelectItem value="junges_erwachsenenalter" className="text-white hover:bg-white/10">🧑‍🎓 Junges Erwachsenenalter</SelectItem>
              <SelectItem value="erwachsenenalter" className="text-white hover:bg-white/10">🧑‍💼 Erwachsenenalter</SelectItem>
              <SelectItem value="spät_diagnostiziert" className="text-white hover:bg-white/10">🔍 Spät diagnostiziert</SelectItem>
              <SelectItem value="nicht_diagnostiziert" className="text-white hover:bg-white/10">❓ Nicht diagnostiziert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-white">Genesungsstatus</Label>
          <Select value={formData.recovery_status || ''} onValueChange={val => u('recovery_status', val)}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              <SelectItem value="nicht_zutreffend" className="text-white hover:bg-white/10">➖ Nicht zutreffend</SelectItem>
              <SelectItem value="aktiv_krank" className="text-white hover:bg-white/10">🔴 Aktiv krank</SelectItem>
              <SelectItem value="in_behandlung" className="text-white hover:bg-white/10">🟡 In Behandlung</SelectItem>
              <SelectItem value="in_genesung" className="text-white hover:bg-white/10">🟢 In Genesung</SelectItem>
              <SelectItem value="stabil" className="text-white hover:bg-white/10">✅ Stabil</SelectItem>
              <SelectItem value="rückfällig" className="text-white hover:bg-white/10">🔄 Rückfällig</SelectItem>
              <SelectItem value="chronisch_stabil" className="text-white hover:bg-white/10">⚖️ Chronisch stabil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Selbstverletzung</Label>
        <Textarea value={formData.self_harm_history || ''} onChange={e => u('self_harm_history', e.target.value)} placeholder="z.B. Hat sich als Teenager geritzt, seit 3 Jahren clean..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Suizidalität</Label>
        <Textarea value={formData.suicidality_history || ''} onChange={e => u('suicidality_history', e.target.value)} placeholder="z.B. Suizidversuch mit 19, seitdem in Therapie und stabil..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
      </div>
    </div>
  );
}