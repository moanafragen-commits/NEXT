import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HOUR_LABELS = {
  0: '00:00', 1: '01:00', 2: '02:00', 3: '03:00', 4: '04:00', 5: '05:00',
  6: '06:00', 7: '07:00', 8: '08:00', 9: '09:00', 10: '10:00', 11: '11:00',
  12: '12:00', 13: '13:00', 14: '14:00', 15: '15:00', 16: '16:00', 17: '17:00',
  18: '18:00', 19: '19:00', 20: '20:00', 21: '21:00', 22: '22:00', 23: '23:00'
};

export default function DailySchedulePanel({ character }) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dayType, setDayType] = useState('weekday');
  const currentHour = new Date().getHours();

  const { data: schedule = [] } = useQuery({
    queryKey: ['daily-schedule', character.id, dayType],
    queryFn: () => base44.entities.DailySchedule.filter({ character_id: character.id, day_type: dayType }, 'hour'),
    enabled: !!character.id
  });

  const generateSchedule = async () => {
    setIsGenerating(true);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Erstelle einen realistischen Tagesablauf für ${character.name}.
Persönlichkeit: ${character.personality?.slice(0, 200)}
Beruf: ${character.occupation || 'nicht angegeben'}
Alter: ${character.age || 'nicht angegeben'}
Schlafmuster: ${character.sleeping_pattern || 'normal'}
Energielevel: ${character.energy_level || 'mittel'}
Tagestyp: ${dayType === 'weekday' ? 'Wochentag' : 'Wochenende'}

Erstelle für jede Stunde (0-23) eine kurze Aktivität und einen Ort. Sei kreativ und realistisch.`,
      response_json_schema: {
        type: "object",
        properties: {
          schedule: {
            type: "array",
            items: {
              type: "object",
              properties: {
                hour: { type: "number" },
                activity: { type: "string" },
                location: { type: "string" },
                emoji: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Delete old schedule
    const old = await base44.entities.DailySchedule.filter({ character_id: character.id, day_type: dayType });
    await Promise.all(old.map(s => base44.entities.DailySchedule.delete(s.id)));

    // Create new
    for (const entry of response.schedule) {
      await base44.entities.DailySchedule.create({
        character_id: character.id,
        hour: entry.hour,
        activity: entry.activity,
        location: entry.location,
        emoji: entry.emoji,
        day_type: dayType
      });
    }

    queryClient.invalidateQueries({ queryKey: ['daily-schedule', character.id, dayType] });
    setIsGenerating(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDayType('weekday')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${dayType === 'weekday' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-500 border border-transparent'}`}
        >
          Wochentag
        </button>
        <button
          onClick={() => setDayType('weekend')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${dayType === 'weekend' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-500 border border-transparent'}`}
        >
          Wochenende
        </button>
      </div>

      {schedule.length === 0 ? (
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">Noch kein Tagesablauf erstellt</p>
          <Button
            onClick={generateSchedule}
            disabled={isGenerating}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
            Tagesablauf generieren
          </Button>
        </div>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {schedule.map((entry) => {
            const isCurrent = entry.hour === currentHour;
            return (
              <div
                key={entry.hour}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isCurrent ? 'bg-emerald-500/15 border border-emerald-500/30' : 'hover:bg-white/5'
                }`}
              >
                <span className={`text-xs font-mono w-12 ${isCurrent ? 'text-emerald-400 font-bold' : 'text-gray-600'}`}>
                  {HOUR_LABELS[entry.hour]}
                </span>
                <span className="text-sm">{entry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isCurrent ? 'text-white font-medium' : 'text-gray-300'}`}>{entry.activity}</p>
                  {entry.location && <p className="text-[10px] text-gray-500 truncate">📍 {entry.location}</p>}
                </div>
                {isCurrent && <span className="text-[10px] text-emerald-400 font-medium">JETZT</span>}
              </div>
            );
          })}
          <div className="pt-2">
            <Button onClick={generateSchedule} disabled={isGenerating} size="sm" variant="outline" className="w-full border-white/10 text-gray-400 hover:text-white text-xs">
              {isGenerating ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
              Neu generieren
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}