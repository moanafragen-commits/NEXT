import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function RelationshipStats({ characterId, userEmail }) {
  const { data: events = [] } = useQuery({
    queryKey: ['relationship-events', characterId],
    queryFn: () => base44.entities.RelationshipEvent.filter({ character_id: characterId, user_email: userEmail }, 'created_date'),
    enabled: !!characterId && !!userEmail
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages-stats', characterId],
    queryFn: () => base44.entities.ChatMessage.filter({ character_id: characterId }, 'created_date'),
    enabled: !!characterId
  });

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });

  // Trust/jealousy/closeness over time
  const eventData = [];
  let trust = 5, jealousy = 3, closeness = 5;
  for (const ev of events) {
    if (ev.attribute_changed === 'Vertrauen') trust = parseInt(ev.new_value) || trust;
    if (ev.attribute_changed === 'Eifersucht') jealousy = parseInt(ev.new_value) || jealousy;
    if (ev.attribute_changed === 'Nähe') closeness = parseInt(ev.new_value) || closeness;
    eventData.push({
      date: new Date(ev.created_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
      trust, jealousy, closeness
    });
  }

  // Messages per day of week
  const dayDistribution = [0, 0, 0, 0, 0, 0, 0];
  const dayLabels = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  messages.forEach(m => {
    const day = new Date(m.created_date).getDay();
    dayDistribution[day]++;
  });
  const dayData = dayLabels.map((label, i) => ({ name: label, count: dayDistribution[i] }));

  // Mood distribution
  const moodCounts = {};
  events.forEach(ev => {
    if (ev.description) {
      // Simple mood tracking from events
    }
  });

  // Message ratio
  const userMsgs = messages.filter(m => m.role === 'user').length;
  const aiMsgs = messages.filter(m => m.role === 'assistant').length;
  const ratioData = [
    { name: 'Du', value: userMsgs, color: '#10b981' },
    { name: character?.name || 'KI', value: aiMsgs, color: '#6366f1' },
  ];

  // Average response time (simplified)
  const totalMsgs = messages.length;
  const daysActive = messages.length > 1 
    ? Math.max(1, Math.ceil((new Date(messages[messages.length - 1]?.created_date) - new Date(messages[0]?.created_date)) / (1000 * 60 * 60 * 24)))
    : 1;
  const msgsPerDay = (totalMsgs / daysActive).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-400">{totalMsgs}</p>
          <p className="text-[10px] text-gray-500">Nachrichten</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-indigo-400">{daysActive}</p>
          <p className="text-[10px] text-gray-500">Tage aktiv</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-amber-400">{msgsPerDay}</p>
          <p className="text-[10px] text-gray-500">Nachr./Tag</p>
        </div>
      </div>

      {/* Relationship Evolution Chart */}
      {eventData.length > 2 && (
        <div>
          <p className="text-xs text-gray-400 font-medium mb-2">Beziehungsverlauf</p>
          <div className="bg-white/5 rounded-xl p-3">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={eventData}>
                <defs>
                  <linearGradient id="trustGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="jealousyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#666', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="trust" stroke="#10b981" fill="url(#trustGrad)" name="Vertrauen" />
                <Area type="monotone" dataKey="jealousy" stroke="#ef4444" fill="url(#jealousyGrad)" name="Eifersucht" />
                <Area type="monotone" dataKey="closeness" stroke="#8b5cf6" fill="none" strokeDasharray="3 3" name="Nähe" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Message Ratio */}
      <div>
        <p className="text-xs text-gray-400 font-medium mb-2">Nachrichtenverhältnis</p>
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-4">
          <div className="w-20 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ratioData} dataKey="value" innerRadius={22} outerRadius={35} paddingAngle={3}>
                  {ratioData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {ratioData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-gray-300">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity by Day */}
      <div>
        <p className="text-xs text-gray-400 font-medium mb-2">Aktivität nach Wochentag</p>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-end gap-1 h-16">
            {dayData.map(d => {
              const max = Math.max(...dayData.map(x => x.count), 1);
              const height = (d.count / max) * 100;
              return (
                <div key={d.name} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-emerald-500/40 rounded-t" 
                    style={{ height: `${Math.max(height, 4)}%` }} 
                  />
                  <span className="text-[9px] text-gray-500">{d.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}