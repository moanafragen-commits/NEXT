import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const LOCATION_TEMPLATES = {
  zuhause: { emoji: '🏠', activities: ['chillt auf dem Sofa', 'kocht gerade', 'räumt auf', 'schaut Netflix', 'liegt im Bett'] },
  arbeit: { emoji: '💼', activities: ['arbeitet konzentriert', 'hat Pause', 'ist in einem Meeting', 'trinkt Kaffee am Schreibtisch'] },
  café: { emoji: '☕', activities: ['trinkt einen Latte', 'liest ein Buch', 'wartet auf jemanden', 'arbeitet am Laptop'] },
  restaurant: { emoji: '🍽️', activities: ['isst zu Abend', 'wartet auf Essen', 'probiert etwas Neues'] },
  park: { emoji: '🌳', activities: ['spaziert', 'sitzt auf einer Bank', 'macht Sport', 'genießt die Sonne'] },
  fitnessstudio: { emoji: '💪', activities: ['trainiert', 'macht Cardio', 'dehnt sich', 'ist fast fertig'] },
  schule: { emoji: '🏫', activities: ['ist im Unterricht', 'hat Freistunde', 'lernt in der Bibliothek'] },
  uni: { emoji: '🎓', activities: ['ist in der Vorlesung', 'lernt in der Bib', 'sitzt in der Mensa'] },
  einkaufen: { emoji: '🛍️', activities: ['schlendert durch Läden', 'sucht etwas Bestimmtes', 'steht an der Kasse'] },
  bar: { emoji: '🍸', activities: ['trinkt einen Cocktail', 'tanzt', 'unterhält sich', 'sitzt an der Bar'] },
  kino: { emoji: '🎬', activities: ['schaut einen Film', 'wartet auf den Film', 'isst Popcorn'] },
  bibliothek: { emoji: '📚', activities: ['liest', 'recherchiert', 'lernt für Prüfungen'] },
  freunde: { emoji: '👫', activities: ['hängt mit Freunden ab', 'ist auf einer Party', 'spielt Spiele'] },
  unterwegs: { emoji: '🚶', activities: ['ist unterwegs', 'fährt mit dem Bus', 'läuft durch die Stadt'] },
  andere: { emoji: '📍', activities: ['ist beschäftigt'] }
};

export function generateRandomLocation(character) {
  const hour = new Date().getHours();
  let possibleTypes = [];
  
  if (hour >= 0 && hour < 7) possibleTypes = ['zuhause'];
  else if (hour >= 7 && hour < 9) possibleTypes = ['zuhause', 'unterwegs', 'café'];
  else if (hour >= 9 && hour < 12) possibleTypes = ['arbeit', 'uni', 'schule', 'café', 'bibliothek'];
  else if (hour >= 12 && hour < 14) possibleTypes = ['restaurant', 'café', 'arbeit', 'park'];
  else if (hour >= 14 && hour < 17) possibleTypes = ['arbeit', 'uni', 'einkaufen', 'café', 'fitnessstudio'];
  else if (hour >= 17 && hour < 20) possibleTypes = ['zuhause', 'fitnessstudio', 'park', 'einkaufen', 'freunde', 'restaurant'];
  else possibleTypes = ['zuhause', 'bar', 'kino', 'freunde', 'restaurant'];

  const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
  const template = LOCATION_TEMPLATES[type];
  const activity = template.activities[Math.floor(Math.random() * template.activities.length)];
  
  const locationNames = {
    zuhause: 'Zuhause',
    arbeit: character.occupation || 'Büro',
    café: ['Starbucks', 'Café Luna', 'Coffee House', 'Kleines Eck-Café'][Math.floor(Math.random() * 4)],
    restaurant: ['Pizzeria Bella', 'Sushi Bar', 'Burger Laden', 'Asia Imbiss'][Math.floor(Math.random() * 4)],
    park: ['Stadtpark', 'Am See', 'Botanischer Garten'][Math.floor(Math.random() * 3)],
    fitnessstudio: 'Fitnessstudio',
    schule: 'Schule',
    uni: 'Universität',
    einkaufen: ['Einkaufszentrum', 'Innenstadt', 'Supermarkt'][Math.floor(Math.random() * 3)],
    bar: ['Cocktailbar', 'Kneipe', 'Skybar'][Math.floor(Math.random() * 3)],
    kino: 'Kino',
    bibliothek: 'Stadtbibliothek',
    freunde: 'Bei Freunden',
    unterwegs: 'Unterwegs',
    andere: 'Unterwegs'
  };

  return {
    location_name: locationNames[type],
    location_type: type,
    emoji: template.emoji,
    description: activity,
    shared_at: new Date().toISOString()
  };
}

export default function LocationSharing({ characterId }) {
  const { data: location } = useQuery({
    queryKey: ['character-location', characterId],
    queryFn: async () => {
      const locs = await base44.entities.CharacterLocation.filter({ character_id: characterId }, '-created_date', 1);
      return locs[0] || null;
    },
    enabled: !!characterId
  });

  if (!location) return null;

  const timeSince = location.shared_at ? format(new Date(location.shared_at), 'HH:mm', { locale: de }) : '';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
      <span className="text-sm">{location.emoji || '📍'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-blue-300 truncate">{location.location_name}</p>
        <p className="text-[10px] text-blue-400/60 truncate">{location.description}</p>
      </div>
      <span className="text-[10px] text-blue-400/40">{timeSince}</span>
    </div>
  );
}