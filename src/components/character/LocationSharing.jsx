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

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const CITY_COORDS = {
  berlin: { lat: 52.52, lng: 13.405 },
  münchen: { lat: 48.1351, lng: 11.582 },
  hamburg: { lat: 53.5511, lng: 9.9937 },
  köln: { lat: 50.9375, lng: 6.9603 },
  frankfurt: { lat: 50.1109, lng: 8.6821 },
  stuttgart: { lat: 48.7758, lng: 9.1829 },
  düsseldorf: { lat: 51.2277, lng: 6.7735 },
  leipzig: { lat: 51.3397, lng: 12.3731 },
  dortmund: { lat: 51.5136, lng: 7.4653 },
  essen: { lat: 51.4556, lng: 7.0116 },
  bremen: { lat: 53.0793, lng: 8.8017 },
  dresden: { lat: 51.0504, lng: 13.7373 },
  hannover: { lat: 52.3759, lng: 9.732 },
  nürnberg: { lat: 49.4521, lng: 11.0767 },
  wien: { lat: 48.2082, lng: 16.3738 },
  zürich: { lat: 47.3769, lng: 8.5417 },
  los_angeles: { lat: 34.0522, lng: -118.2437 },
  new_york: { lat: 40.7128, lng: -74.006 },
  london: { lat: 51.5074, lng: -0.1278 },
  paris: { lat: 48.8566, lng: 2.3522 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  seoul: { lat: 37.5665, lng: 126.978 },
  rom: { lat: 41.9028, lng: 12.4964 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
};

function getCityCoordinates(cityName) {
  if (!cityName) return null;
  const lower = cityName.toLowerCase().replace(/ü/g, 'ue').replace(/ö/g, 'oe').replace(/ä/g, 'ae');
  // Direct match
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(key) || key.includes(lower)) return coords;
  }
  // Fuzzy match on original names
  const lowerOriginal = cityName.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (lowerOriginal.includes(key)) return coords;
  }
  return null;
}

// Determine the character's home city from their profile info
function getCharacterHomeCity(character) {
  // Check living_situation first (e.g. "Wohnung in Los Angeles", "WG in Berlin")
  const living = character.living_situation || '';
  const bg = character.background_culture || '';
  const bio = character.biography || '';
  const occupation = character.occupation || '';
  const name = character.name || '';
  
  // Combine all text fields to search for city names
  const allText = `${living} ${bg} ${bio} ${occupation}`.toLowerCase();
  
  // Check all known cities
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (allText.includes(key)) return { name: key, coords };
  }
  
  // Additional city aliases
  const cityAliases = {
    'la': 'los_angeles', 'l.a.': 'los_angeles', 'l.a': 'los_angeles', 'hollywood': 'los_angeles', 'beverly hills': 'los_angeles', 'santa monica': 'los_angeles',
    'nyc': 'new_york', 'manhattan': 'new_york', 'brooklyn': 'new_york',
    'tokio': 'tokyo', 'tōkyō': 'tokyo',
    'mailand': 'rom', 'italia': 'rom',
    'england': 'london', 'uk': 'london',
    'frankreich': 'paris', 'france': 'paris',
    'spanien': 'barcelona', 'spain': 'barcelona',
    'japan': 'tokyo', 'korea': 'seoul', 'südkorea': 'seoul',
    'usa': 'los_angeles', 'amerika': 'new_york', 'california': 'los_angeles', 'kalifornien': 'los_angeles',
    'niederlande': 'amsterdam', 'holland': 'amsterdam',
    'österreich': 'wien', 'austria': 'wien',
    'schweiz': 'zürich', 'switzerland': 'zürich',
  };
  
  for (const [alias, cityKey] of Object.entries(cityAliases)) {
    if (allText.includes(alias)) {
      return { name: cityKey, coords: CITY_COORDS[cityKey] };
    }
  }
  
  return null;
}

function getCharacterLocations(character) {
  const city = character.living_situation || '';
  const job = character.occupation || '';
  const interests = (character.interests || '').toLowerCase();
  const fitness = character.physical_fitness || 'durchschnittlich';
  const age = character.age || '';
  const isStudent = job.toLowerCase().includes('student') || job.toLowerCase().includes('schüler') || 
                    city.toLowerCase().includes('uni') || city.toLowerCase().includes('wg');
  const isWorkingOut = ['sportlich', 'sehr_sportlich', 'athletisch'].includes(fitness) || 
                       interests.includes('sport') || interests.includes('fitness') || interests.includes('gym');

  // Build personalized location names
  const cityName = city.match(/(?:in\s+)?([A-ZÄÖÜ][a-zäöüß]+(?:\s[A-ZÄÖÜ][a-zäöüß]+)*)/)?.[1] || '';
  
  const homeLabel = city || 'Zuhause';
  const workLabel = job || 'Büro';

  const cafés = cityName 
    ? [`Café in ${cityName}`, `Starbucks ${cityName}`, `Kleines Eck-Café`]
    : ['Starbucks', 'Café Luna', 'Coffee House', 'Kleines Eck-Café'];

  const restaurants = cityName
    ? [`Restaurant in ${cityName}`, `Lieblingsrestaurant`, `Imbiss um die Ecke`]
    : ['Pizzeria Bella', 'Sushi Bar', 'Burger Laden', 'Asia Imbiss'];

  const parks = cityName
    ? [`Stadtpark ${cityName}`, `Park in ${cityName}`, `Am Fluss`]
    : ['Stadtpark', 'Am See', 'Botanischer Garten'];

  const bars = cityName
    ? [`Bar in ${cityName}`, `Club in ${cityName}`, `Lieblingsbar`]
    : ['Cocktailbar', 'Kneipe', 'Skybar'];

  const shops = cityName
    ? [`Einkaufszentrum ${cityName}`, `Innenstadt ${cityName}`, `Supermarkt`]
    : ['Einkaufszentrum', 'Innenstadt', 'Supermarkt'];

  return { homeLabel, workLabel, cafés, restaurants, parks, bars, shops, isStudent, isWorkingOut, cityName };
}

export function generateRandomLocation(character) {
  const hour = new Date().getHours();
  const loc = getCharacterLocations(character);
  const interests = (character.interests || '').toLowerCase();
  const sleeping = character.sleeping_pattern || 'normal';
  const isNightOwl = sleeping === 'nachtmensch' || sleeping === 'chaotisch';
  
  // Build weighted location pools based on time + character traits
  let pool = []; // { type, weight }
  
  if (hour >= 0 && hour < 7) {
    pool = [{ type: 'zuhause', weight: isNightOwl ? 6 : 10 }];
    if (isNightOwl) pool.push({ type: 'bar', weight: 2 }, { type: 'freunde', weight: 2 });
  } else if (hour >= 7 && hour < 9) {
    pool = [
      { type: 'zuhause', weight: 4 },
      { type: 'unterwegs', weight: 3 },
      { type: 'café', weight: 3 },
    ];
    if (loc.isWorkingOut) pool.push({ type: 'fitnessstudio', weight: 3 });
  } else if (hour >= 9 && hour < 12) {
    pool = [
      { type: 'arbeit', weight: character.occupation ? 6 : 2 },
      { type: 'café', weight: 2 },
    ];
    if (loc.isStudent) pool.push({ type: 'uni', weight: 5 });
    if (interests.includes('lesen') || interests.includes('buch')) pool.push({ type: 'bibliothek', weight: 2 });
  } else if (hour >= 12 && hour < 14) {
    pool = [
      { type: 'restaurant', weight: 4 },
      { type: 'café', weight: 3 },
      { type: 'arbeit', weight: character.occupation ? 3 : 1 },
      { type: 'park', weight: 2 },
    ];
  } else if (hour >= 14 && hour < 17) {
    pool = [
      { type: 'arbeit', weight: character.occupation ? 5 : 2 },
      { type: 'café', weight: 2 },
      { type: 'einkaufen', weight: 2 },
    ];
    if (loc.isStudent) pool.push({ type: 'uni', weight: 4 }, { type: 'bibliothek', weight: 2 });
    if (loc.isWorkingOut) pool.push({ type: 'fitnessstudio', weight: 3 });
  } else if (hour >= 17 && hour < 20) {
    pool = [
      { type: 'zuhause', weight: 3 },
      { type: 'park', weight: 2 },
      { type: 'einkaufen', weight: 2 },
      { type: 'freunde', weight: 2 },
      { type: 'restaurant', weight: 2 },
    ];
    if (loc.isWorkingOut) pool.push({ type: 'fitnessstudio', weight: 3 });
  } else {
    pool = [
      { type: 'zuhause', weight: 4 },
      { type: 'bar', weight: 2 },
      { type: 'kino', weight: 2 },
      { type: 'freunde', weight: 2 },
      { type: 'restaurant', weight: 2 },
    ];
  }

  // Hobby-based bonus locations
  if (interests.includes('kunst') || interests.includes('museum')) pool.push({ type: 'andere', weight: 1 });
  
  // Weighted random pick
  const totalWeight = pool.reduce((s, p) => s + p.weight, 0);
  let rand = Math.random() * totalWeight;
  let type = pool[0].type;
  for (const p of pool) {
    rand -= p.weight;
    if (rand <= 0) { type = p.type; break; }
  }

  const template = LOCATION_TEMPLATES[type];
  
  // Personalized activity based on character
  let activities = [...template.activities];
  if (type === 'zuhause' && interests) {
    const hobbies = interests.split(',').map(h => h.trim()).filter(Boolean);
    if (hobbies.length > 0) activities.push(`beschäftigt sich mit ${pick(hobbies)}`);
    if (character.pets) activities.push(`kuschelt mit ${character.pets}`);
  }
  if (type === 'arbeit' && character.occupation) {
    activities = [`arbeitet als ${character.occupation}`, 'ist in einem Meeting', 'hat Mittagspause', 'arbeitet konzentriert'];
  }
  
  const activity = pick(activities);

  const locationNames = {
    zuhause: loc.homeLabel,
    arbeit: loc.workLabel,
    café: pick(loc.cafés),
    restaurant: pick(loc.restaurants),
    park: pick(loc.parks),
    fitnessstudio: loc.cityName ? `Fitnessstudio in ${loc.cityName}` : 'Fitnessstudio',
    schule: 'Schule',
    uni: loc.cityName ? `Uni ${loc.cityName}` : 'Universität',
    einkaufen: pick(loc.shops),
    bar: pick(loc.bars),
    kino: loc.cityName ? `Kino in ${loc.cityName}` : 'Kino',
    bibliothek: loc.cityName ? `Bibliothek ${loc.cityName}` : 'Stadtbibliothek',
    freunde: 'Bei Freunden',
    unterwegs: loc.cityName ? `Unterwegs in ${loc.cityName}` : 'Unterwegs',
    andere: 'Unterwegs'
  };

  // Generate realistic coordinates based on character's city
  const cityCoords = getCityCoordinates(loc.cityName);
  const jitter = () => (Math.random() - 0.5) * 0.03; // ~1.5km radius scatter
  const lat = cityCoords.lat + jitter();
  const lng = cityCoords.lng + jitter();

  // Generate a plausible address
  const streets = ['Hauptstraße', 'Bahnhofstraße', 'Berliner Straße', 'Marktplatz', 'Schillerstraße', 'Goethestraße', 'Friedrichstraße', 'Lindenallee', 'Parkweg', 'Am Stadtpark', 'Königstraße', 'Mozartstraße', 'Rosenstraße'];
  const streetNum = Math.floor(Math.random() * 120) + 1;
  const address = `${pick(streets)} ${streetNum}`;

  return {
    location_name: locationNames[type],
    location_type: type,
    emoji: template.emoji,
    description: activity,
    shared_at: new Date().toISOString(),
    latitude: lat,
    longitude: lng,
    city: loc.cityName || 'Berlin',
    address
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