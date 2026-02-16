import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wallet } from 'lucide-react';

export default function FinanzenTab({ formData, setFormData }) {
  const u = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <p className="text-xs text-emerald-300">💰 Beruf, Einkommen und finanzieller Lebensstil – beeinflusst, wie der Charakter über Geld spricht.</p>
      </div>

      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
          <Wallet className="w-4 h-4" /> Beruf & Finanzen
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Beruf</Label>
          <Input value={formData.occupation || ''} onChange={e => u('occupation', e.target.value)} placeholder="z.B. Softwareentwickler, Student..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Bildung</Label>
          <Input value={formData.education || ''} onChange={e => u('education', e.target.value)} placeholder="z.B. Studium Informatik, Ausbildung..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>
    </div>
  );
}