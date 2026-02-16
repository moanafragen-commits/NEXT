import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, CalendarHeart, Gift, Heart, Baby, Star, Calendar, Sparkles, X } from 'lucide-react';
import { format, differenceInDays, parseISO, setYear } from 'date-fns';
import { de } from 'date-fns/locale';

const EVENT_TYPES = [
  { value: 'geburtstag_user', label: 'Mein Geburtstag', icon: Gift, color: 'text-pink-400' },
  { value: 'geburtstag_charakter', label: 'Charakter-Geburtstag', icon: Gift, color: 'text-purple-400' },
  { value: 'hochzeitstag', label: 'Hochzeitstag', icon: Heart, color: 'text-red-400' },
  { value: 'zusammengekommen', label: 'Zusammengekommen', icon: Heart, color: 'text-rose-400' },
  { value: 'erster_kuss', label: 'Erster Kuss', icon: Heart, color: 'text-pink-300' },
  { value: 'erstes_date', label: 'Erstes Date', icon: CalendarHeart, color: 'text-rose-300' },
  { value: 'geburt_kind', label: 'Geburt des Kindes', icon: Baby, color: 'text-blue-400' },
  { value: 'jahrestag', label: 'Jahrestag', icon: Star, color: 'text-amber-400' },
  { value: 'kennenlernen', label: 'Kennenlernen', icon: Sparkles, color: 'text-emerald-400' },
  { value: 'verlobung', label: 'Verlobung', icon: Heart, color: 'text-yellow-400' },
  { value: 'umzug', label: 'Zusammengezogen', icon: Calendar, color: 'text-teal-400' },
  { value: 'abschluss', label: 'Abschluss/Prüfung', icon: Star, color: 'text-indigo-400' },
  { value: 'anderes', label: 'Anderes Ereignis', icon: Calendar, color: 'text-gray-400' },
];

function getDaysUntilNext(dateStr) {
  const today = new Date();
  const eventDate = parseISO(dateStr);
  let nextOccurrence = setYear(eventDate, today.getFullYear());
  if (nextOccurrence < today) {
    nextOccurrence = setYear(eventDate, today.getFullYear() + 1);
  }
  return differenceInDays(nextOccurrence, today);
}

function getYearsSince(dateStr) {
  const today = new Date();
  const eventDate = parseISO(dateStr);
  return today.getFullYear() - eventDate.getFullYear();
}

export default function ImportantDatesPanel({ characterId, userEmail }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', event_type: 'anderes', description: '', recurring: true });

  const { data: dates = [] } = useQuery({
    queryKey: ['important-dates', characterId],
    queryFn: () => base44.entities.ImportantDate.filter({ character_id: characterId, user_email: userEmail }),
    enabled: !!characterId && !!userEmail
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ImportantDate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['important-dates', characterId] });
      setShowForm(false);
      setForm({ title: '', date: '', event_type: 'anderes', description: '', recurring: true });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ImportantDate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['important-dates', characterId] })
  });

  const handleCreate = () => {
    if (!form.title || !form.date) return;
    createMutation.mutate({
      ...form,
      character_id: characterId,
      user_email: userEmail,
      reminder_days_before: 0
    });
  };

  const sortedDates = [...dates].sort((a, b) => getDaysUntilNext(a.date) - getDaysUntilNext(b.date));

  return (
    <div className="space-y-3">
      {sortedDates.length === 0 && !showForm && (
        <p className="text-gray-500 text-sm text-center py-4">
          Noch keine wichtigen Daten hinterlegt.
        </p>
      )}

      {sortedDates.map(d => {
        const eventConfig = EVENT_TYPES.find(e => e.value === d.event_type) || EVENT_TYPES[EVENT_TYPES.length - 1];
        const Icon = eventConfig.icon;
        const daysUntil = getDaysUntilNext(d.date);
        const years = getYearsSince(d.date);
        const isToday = daysUntil === 0;
        const isSoon = daysUntil <= 7 && daysUntil > 0;

        return (
          <div
            key={d.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              isToday ? 'bg-emerald-500/10 border-emerald-500/30' :
              isSoon ? 'bg-amber-500/10 border-amber-500/20' :
              'bg-[#1a1a1a] border-white/5'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 ${eventConfig.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">{d.title}</span>
                {isToday && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">HEUTE!</span>}
                {isSoon && <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full">Bald</span>}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {format(parseISO(d.date), 'd. MMMM yyyy', { locale: de })}
                {d.recurring && years > 0 && ` · ${years}. Mal`}
                {!isToday && ` · in ${daysUntil} Tagen`}
              </div>
              {d.description && <p className="text-xs text-gray-400 mt-1 truncate">{d.description}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate(d.id)}
              className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      })}

      {showForm ? (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Neues Datum</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
          <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v, title: EVENT_TYPES.find(e => e.value === v)?.label || form.title })}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map(e => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Name des Ereignisses"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="bg-[#262626] border-white/10 text-white"
          />
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="bg-[#262626] border-white/10 text-white"
          />
          <Textarea
            placeholder="Beschreibung (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="bg-[#262626] border-white/10 text-white h-16"
          />
          <Button
            onClick={handleCreate}
            disabled={!form.title || !form.date || createMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Speichern
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full border-dashed border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Wichtiges Datum hinzufügen
        </Button>
      )}
    </div>
  );
}