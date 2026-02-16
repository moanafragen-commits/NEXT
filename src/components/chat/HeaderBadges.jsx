import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Music, MapPin, Heart, Zap, Target } from 'lucide-react';

const ENERGY_CONFIG = {
  sehr_niedrig: { emoji: '😵', label: 'Erschöpft', color: 'text-red-400' },
  niedrig: { emoji: '😫', label: 'Müde', color: 'text-orange-400' },
  mittel: { emoji: '😊', label: 'Normal', color: 'text-yellow-300' },
  hoch: { emoji: '⚡', label: 'Fit', color: 'text-emerald-400' },
  sehr_hoch: { emoji: '🔥', label: 'Energiegeladen', color: 'text-green-300' },
  schwankend: { emoji: '🔄', label: 'Schwankend', color: 'text-purple-400' },
};

export function SongBadge({ currentSong }) {
  if (!currentSong) return null;
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 max-w-[140px]">
      <Music className="w-3 h-3 text-emerald-400 shrink-0" />
      <span className="text-[10px] text-gray-400 truncate">{currentSong}</span>
    </div>
  );
}

export function LocationBadge({ characterId }) {
  const { data: locations = [] } = useQuery({
    queryKey: ['char-location-badge', characterId],
    queryFn: () => base44.entities.CharacterLocation.filter({ character_id: characterId }, '-created_date', 1),
    enabled: !!characterId,
    staleTime: 60000,
  });

  const loc = locations[0];
  if (!loc) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 max-w-[120px]">
      <span className="text-xs shrink-0">{loc.emoji || '📍'}</span>
      <span className="text-[10px] text-gray-400 truncate">{loc.location_name}</span>
    </div>
  );
}

export function RelationshipBadge({ trustLevel }) {
  if (trustLevel == null) return null;
  const trust = Number(trustLevel);
  let color = 'text-gray-400';
  if (trust >= 8) color = 'text-pink-400';
  else if (trust >= 6) color = 'text-rose-400';
  else if (trust >= 4) color = 'text-orange-300';
  else color = 'text-gray-400';

  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
      <Heart className={`w-3 h-3 ${color} ${trust >= 7 ? 'fill-current' : ''}`} />
      <span className={`text-[10px] ${color}`}>{trust}/10</span>
    </div>
  );
}

export function EnergyBadge({ energyLevel }) {
  if (!energyLevel) return null;
  const config = ENERGY_CONFIG[energyLevel] || ENERGY_CONFIG.mittel;

  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
      <span className="text-xs">{config.emoji}</span>
      <span className={`text-[10px] ${config.color}`}>{config.label}</span>
    </div>
  );
}

export function MotivationBadge({ motivation, progress }) {
  if (!motivation) return null;
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 max-w-[150px]">
      <Target className="w-3 h-3 text-amber-400 shrink-0" />
      <span className="text-[10px] text-gray-400 truncate">{motivation}</span>
      {progress > 0 && (
        <span className="text-[9px] text-amber-400 shrink-0">{progress}%</span>
      )}
    </div>
  );
}

export function ActivityBadge({ characterId }) {
  const { data: schedules = [] } = useQuery({
    queryKey: ['char-schedule-badge', characterId],
    queryFn: () => base44.entities.DailySchedule.filter({ character_id: characterId }),
    enabled: !!characterId,
    staleTime: 120000,
  });

  if (schedules.length === 0) return null;

  const now = new Date();
  const hour = now.getHours();
  const isWeekend = [0, 6].includes(now.getDay());
  const dayType = isWeekend ? 'weekend' : 'weekday';
  
  const current = schedules.find(s => s.hour === hour && s.day_type === dayType)
    || schedules.find(s => s.hour === hour);
  
  if (!current) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 max-w-[130px]">
      <span className="text-xs shrink-0">{current.emoji || '📋'}</span>
      <span className="text-[10px] text-gray-400 truncate">{current.activity}</span>
    </div>
  );
}