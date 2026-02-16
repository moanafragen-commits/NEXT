import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ENTRY_TYPES = [
  { value: 'termin', label: '📅 Termin' },
  { value: 'aufgabe', label: '✅ Aufgabe' },
  { value: 'erinnerung', label: '🔔 Erinnerung' },
  { value: 'event', label: '🎉 Event' },
  { value: 'geburtstag', label: '🎂 Geburtstag' },
];

const PRIORITIES = [
  { value: 'niedrig', label: 'Niedrig' },
  { value: 'mittel', label: 'Mittel' },
  { value: 'hoch', label: 'Hoch' },
  { value: 'dringend', label: 'Dringend' },
];

export default function AddEntrySheet({ date, onClose, onAdd, isSaving }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [entryType, setEntryType] = useState('termin');
  const [priority, setPriority] = useState('mittel');
  const [rewardCoins, setRewardCoins] = useState(10);
  const [rewardXp, setRewardXp] = useState(15);
  const [penaltyCoins, setPenaltyCoins] = useState(5);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      date,
      time: time || null,
      entry_type: entryType,
      priority,
      reward_coins: rewardCoins,
      reward_xp: rewardXp,
      penalty_coins: penaltyCoins,
      penalty_xp: Math.round(penaltyCoins * 0.5),
      emoji: ENTRY_TYPES.find(t => t.value === entryType)?.label.split(' ')[0] || '📅',
      status: 'offen',
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Neuer Eintrag</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Titel *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Was steht an?"
              className="bg-white/5 border-white/10 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Beschreibung</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details..."
              className="bg-white/5 border-white/10 text-white placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Typ</label>
              <Select value={entryType} onValueChange={setEntryType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRY_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Priorität</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Uhrzeit (optional)</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400 mb-2">Belohnung & Strafe</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-amber-400">🪙 Coins</label>
                <Input type="number" value={rewardCoins} onChange={(e) => setRewardCoins(Number(e.target.value))} className="bg-white/5 border-white/10 text-white h-8 text-xs mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-emerald-400">⭐ XP</label>
                <Input type="number" value={rewardXp} onChange={(e) => setRewardXp(Number(e.target.value))} className="bg-white/5 border-white/10 text-white h-8 text-xs mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-red-400">⚡ Strafe</label>
                <Input type="number" value={penaltyCoins} onChange={(e) => setPenaltyCoins(Number(e.target.value))} className="bg-white/5 border-white/10 text-white h-8 text-xs mt-1" />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-600 text-center">
            Datum: {new Date(date + 'T00:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || isSaving}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-base font-semibold"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Eintrag erstellen
          </Button>
        </div>
      </motion.div>
    </>
  );
}