import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const WEATHER_DATA = {
  sonnig: { emoji: '☀️', label: 'Sonnig', moodEffect: ['fröhlich', 'motiviert', 'energetisch', 'warm'] },
  heiter: { emoji: '🌤️', label: 'Heiter', moodEffect: ['zufrieden', 'entspannt', 'fröhlich'] },
  bewölkt: { emoji: '☁️', label: 'Bewölkt', moodEffect: ['nachdenklich', 'ruhig', 'neutral'] },
  regen: { emoji: '🌧️', label: 'Regen', moodEffect: ['melancholisch', 'verträumt', 'gemütlich', 'nachdenklich'] },
  gewitter: { emoji: '⛈️', label: 'Gewitter', moodEffect: ['ängstlich', 'aufgeregt', 'unruhig', 'dramatisch'] },
  schnee: { emoji: '❄️', label: 'Schnee', moodEffect: ['verträumt', 'nostalgisch', 'kindlich', 'fröhlich'] },
  nebel: { emoji: '🌫️', label: 'Nebel', moodEffect: ['geheimnisvoll', 'nachdenklich', 'distanziert'] },
  windig: { emoji: '💨', label: 'Windig', moodEffect: ['unruhig', 'energetisch', 'chaotisch'] },
};

// Climate profiles by region – base temps per month [Jan..Dec] and weather weights per season
const CLIMATE_PROFILES = {
  // Warm/hot, dry climates
  los_angeles: {
    label: 'Los Angeles',
    temps: [14, 15, 16, 17, 19, 21, 24, 24, 23, 20, 17, 14],
    seasons: {
      winter: { sonnig: 30, heiter: 30, bewölkt: 20, regen: 15, windig: 5 },
      spring: { sonnig: 40, heiter: 30, bewölkt: 15, regen: 10, windig: 5 },
      summer: { sonnig: 55, heiter: 25, bewölkt: 10, windig: 5, regen: 5 },
      fall:   { sonnig: 35, heiter: 30, bewölkt: 15, regen: 10, windig: 10 },
    }
  },
  california: {
    label: 'Kalifornien',
    temps: [13, 14, 15, 17, 19, 22, 25, 25, 23, 19, 15, 12],
    seasons: {
      winter: { sonnig: 25, heiter: 30, bewölkt: 20, regen: 20, windig: 5 },
      spring: { sonnig: 35, heiter: 30, bewölkt: 15, regen: 15, windig: 5 },
      summer: { sonnig: 50, heiter: 25, bewölkt: 10, windig: 5, regen: 5, gewitter: 5 },
      fall:   { sonnig: 30, heiter: 30, bewölkt: 20, regen: 10, windig: 10 },
    }
  },
  miami: {
    label: 'Miami/Florida',
    temps: [20, 21, 23, 25, 27, 29, 30, 30, 29, 27, 24, 21],
    seasons: {
      winter: { sonnig: 40, heiter: 30, bewölkt: 15, regen: 10, windig: 5 },
      spring: { sonnig: 35, heiter: 25, bewölkt: 15, regen: 15, gewitter: 10 },
      summer: { sonnig: 25, heiter: 20, bewölkt: 15, regen: 20, gewitter: 20 },
      fall:   { sonnig: 30, heiter: 25, bewölkt: 15, regen: 15, gewitter: 15 },
    }
  },
  new_york: {
    label: 'New York',
    temps: [-1, 0, 5, 11, 17, 22, 25, 24, 20, 14, 8, 2],
    seasons: {
      winter: { bewölkt: 25, schnee: 25, regen: 15, nebel: 10, heiter: 15, sonnig: 10 },
      spring: { sonnig: 25, heiter: 25, bewölkt: 20, regen: 20, windig: 10 },
      summer: { sonnig: 35, heiter: 25, bewölkt: 15, regen: 10, gewitter: 15 },
      fall:   { bewölkt: 25, regen: 20, heiter: 20, sonnig: 15, nebel: 10, windig: 10 },
    }
  },
  london: {
    label: 'London/UK',
    temps: [5, 5, 7, 10, 13, 16, 19, 18, 16, 12, 8, 5],
    seasons: {
      winter: { bewölkt: 30, regen: 25, nebel: 20, heiter: 15, windig: 10 },
      spring: { bewölkt: 25, heiter: 20, regen: 20, sonnig: 20, windig: 15 },
      summer: { heiter: 25, sonnig: 25, bewölkt: 20, regen: 20, windig: 10 },
      fall:   { bewölkt: 30, regen: 25, nebel: 15, windig: 15, heiter: 15 },
    }
  },
  tokyo: {
    label: 'Tokio/Japan',
    temps: [5, 6, 9, 14, 19, 22, 26, 27, 24, 18, 13, 7],
    seasons: {
      winter: { sonnig: 30, heiter: 25, bewölkt: 25, regen: 10, windig: 10 },
      spring: { heiter: 25, sonnig: 25, bewölkt: 20, regen: 25, windig: 5 },
      summer: { bewölkt: 20, regen: 25, sonnig: 20, heiter: 15, gewitter: 15, windig: 5 },
      fall:   { sonnig: 25, heiter: 25, bewölkt: 20, regen: 20, windig: 10 },
    }
  },
  paris: {
    label: 'Paris',
    temps: [4, 5, 8, 11, 15, 18, 21, 20, 17, 12, 7, 4],
    seasons: {
      winter: { bewölkt: 30, regen: 20, nebel: 15, heiter: 20, sonnig: 10, windig: 5 },
      spring: { heiter: 25, sonnig: 25, bewölkt: 20, regen: 20, windig: 10 },
      summer: { sonnig: 35, heiter: 25, bewölkt: 15, regen: 15, gewitter: 10 },
      fall:   { bewölkt: 30, regen: 25, nebel: 15, heiter: 15, windig: 15 },
    }
  },
  dubai: {
    label: 'Dubai/Naher Osten',
    temps: [19, 20, 23, 27, 31, 34, 36, 36, 33, 29, 25, 21],
    seasons: {
      winter: { sonnig: 45, heiter: 30, bewölkt: 15, regen: 5, windig: 5 },
      spring: { sonnig: 50, heiter: 25, bewölkt: 10, windig: 15 },
      summer: { sonnig: 60, heiter: 20, bewölkt: 5, windig: 15 },
      fall:   { sonnig: 50, heiter: 25, bewölkt: 10, regen: 5, windig: 10 },
    }
  },
  skandinavien: {
    label: 'Skandinavien',
    temps: [-5, -4, 0, 5, 11, 16, 19, 17, 12, 7, 2, -3],
    seasons: {
      winter: { schnee: 35, bewölkt: 25, nebel: 15, windig: 15, heiter: 10 },
      spring: { heiter: 20, bewölkt: 25, regen: 20, sonnig: 20, windig: 15 },
      summer: { sonnig: 30, heiter: 25, bewölkt: 20, regen: 15, windig: 10 },
      fall:   { bewölkt: 30, regen: 25, windig: 15, nebel: 15, heiter: 10, schnee: 5 },
    }
  },
  australien: {
    label: 'Australien',
    // Southern hemisphere – months inverted (Jan=summer)
    temps: [26, 26, 24, 21, 17, 14, 13, 14, 16, 19, 22, 25],
    seasons: {
      // Australian seasons: Dec-Feb=summer, Mar-May=fall, Jun-Aug=winter, Sep-Nov=spring
      winter: { sonnig: 25, heiter: 30, bewölkt: 20, regen: 15, windig: 10 },
      spring: { sonnig: 35, heiter: 25, bewölkt: 15, regen: 15, windig: 10 },
      summer: { sonnig: 45, heiter: 25, bewölkt: 10, gewitter: 15, windig: 5 },
      fall:   { sonnig: 30, heiter: 25, bewölkt: 20, regen: 15, windig: 10 },
    }
  },
  // Default = Central Europe / Germany
  default: {
    label: 'Mitteleuropa',
    temps: [-2, 0, 5, 10, 15, 20, 23, 22, 18, 12, 6, 1],
    seasons: {
      winter: { bewölkt: 25, schnee: 20, nebel: 15, regen: 15, heiter: 15, sonnig: 10 },
      spring: { sonnig: 25, heiter: 25, bewölkt: 20, regen: 20, windig: 10 },
      summer: { sonnig: 40, heiter: 25, bewölkt: 10, regen: 10, gewitter: 10, windig: 5 },
      fall:   { bewölkt: 25, regen: 25, nebel: 15, windig: 15, heiter: 15, sonnig: 5 },
    }
  }
};

// Match character location/culture to a climate profile
function detectClimateProfile(character) {
  if (!character) return CLIMATE_PROFILES.default;
  
  // Combine all location-relevant fields
  const locationHints = [
    character.living_situation,
    character.background_culture,
    character.favorite_place,
    character.world_setting,
    character.biography,
    character.personality,
    character.name
  ].filter(Boolean).join(' ').toLowerCase();

  const matchers = [
    { keys: ['los angeles', 'l.a.', 'la ', 'hollywood', 'beverly hills', 'santa monica', 'malibu', 'calabasas'], profile: 'los_angeles' },
    { keys: ['california', 'kalifornien', 'san francisco', 'san diego', 'sacramento', 'silicon valley'], profile: 'california' },
    { keys: ['miami', 'florida', 'orlando', 'tampa', 'key west'], profile: 'miami' },
    { keys: ['new york', 'nyc', 'brooklyn', 'manhattan', 'queens', 'bronx', 'boston', 'chicago', 'washington', 'philadelphia', 'detroit'], profile: 'new_york' },
    { keys: ['london', 'england', 'uk', 'united kingdom', 'manchester', 'birmingham', 'schottland', 'scotland', 'irland', 'ireland', 'dublin', 'liverpool'], profile: 'london' },
    { keys: ['tokyo', 'tokio', 'japan', 'osaka', 'kyoto', 'japanisch', 'anime'], profile: 'tokyo' },
    { keys: ['paris', 'frankreich', 'france', 'lyon', 'marseille', 'französisch'], profile: 'paris' },
    { keys: ['dubai', 'abu dhabi', 'saudi', 'arabien', 'katar', 'qatar', 'oman', 'bahrain', 'naher osten', 'middle east'], profile: 'dubai' },
    { keys: ['stockholm', 'oslo', 'kopenhagen', 'helsinki', 'skandinavien', 'schweden', 'norwegen', 'dänemark', 'finnland', 'island', 'reykjavik'], profile: 'skandinavien' },
    { keys: ['sydney', 'melbourne', 'australien', 'australia', 'brisbane', 'perth', 'neuseeland', 'new zealand', 'auckland'], profile: 'australien' },
  ];

  for (const matcher of matchers) {
    for (const key of matcher.keys) {
      if (locationHints.includes(key)) {
        return CLIMATE_PROFILES[matcher.profile];
      }
    }
  }

  return CLIMATE_PROFILES.default;
}

function getSeason(month, profile) {
  // Southern hemisphere inversion for Australia
  if (profile === CLIMATE_PROFILES.australien) {
    if (month >= 11 || month <= 1) return 'summer';
    if (month >= 2 && month <= 4) return 'fall';
    if (month >= 5 && month <= 7) return 'winter';
    return 'spring';
  }
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

// Seasonal weather probabilities based on character location
function getSeasonalWeather(character) {
  const month = new Date().getMonth();
  const hour = new Date().getHours();
  const profile = detectClimateProfile(character);
  const season = getSeason(month, profile);
  
  const weights = { ...(profile.seasons[season] || profile.seasons.summer) };

  // Night adjustments
  if (hour >= 22 || hour < 6) {
    delete weights.sonnig;
    delete weights.heiter;
    weights.bewölkt = (weights.bewölkt || 0) + 20;
  }

  const total = Object.values(weights).reduce((s, w) => s + w, 0);
  let rand = Math.random() * total;
  
  for (const [weather, weight] of Object.entries(weights)) {
    rand -= weight;
    if (rand <= 0) return weather;
  }
  return 'bewölkt';
}

function getTemperature(character) {
  const month = new Date().getMonth();
  const hour = new Date().getHours();
  const profile = detectClimateProfile(character);
  let temp = profile.temps[month];
  
  // Day/night variation (bigger swing in dry/hot climates)
  const isHotClimate = profile.temps[6] >= 28;
  const dayBonus = isHotClimate ? 5 : 3;
  const nightDrop = isHotClimate ? 7 : 4;

  if (hour >= 12 && hour <= 16) temp += dayBonus;
  else if (hour >= 22 || hour < 6) temp -= nightDrop;
  else if (hour >= 6 && hour < 10) temp -= Math.round(nightDrop * 0.5);
  
  // Random variation ±3
  temp += Math.round((Math.random() - 0.5) * 6);
  return temp;
}

export async function updateWeatherState(userEmail, character) {
  const existing = await base44.entities.WeatherState.filter({ user_email: userEmail }, '-created_date', 1);
  const now = new Date();
  
  // Update every 3 hours
  if (existing[0]) {
    const lastUpdate = new Date(existing[0].last_updated || existing[0].created_date);
    const hoursSince = (now - lastUpdate) / (1000 * 60 * 60);
    if (hoursSince < 3) return existing[0];
  }

  const weather = getSeasonalWeather(character);
  const temperature = getTemperature(character);
  const profile = detectClimateProfile(character);
  
  const data = {
    user_email: userEmail,
    weather,
    temperature,
    city: profile.label || '',
    last_updated: now.toISOString()
  };

  if (existing[0]) {
    await base44.entities.WeatherState.update(existing[0].id, data);
    return { ...existing[0], ...data };
  } else {
    const created = await base44.entities.WeatherState.create(data);
    return created;
  }
}

export function getWeatherMoodInfluence(weather) {
  return WEATHER_DATA[weather]?.moodEffect || [];
}

export function WeatherBadge({ weather, temperature }) {
  if (!weather) return null;
  const data = WEATHER_DATA[weather];
  if (!data) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
      <span className="text-sm">{data.emoji}</span>
      <span className="text-[11px] text-gray-400">{temperature != null ? `${temperature}°` : data.label}</span>
    </div>
  );
}

export function buildWeatherContext(weatherState) {
  if (!weatherState) return '';
  const data = WEATHER_DATA[weatherState.weather];
  if (!data) return '';
  
  const cityHint = weatherState.city ? ` in ${weatherState.city}` : '';
  return `\n\nWETTER${cityHint}: Es ist gerade ${data.label} (${data.emoji}), ${weatherState.temperature}°C. Das Wetter kann deine Stimmung und Gesprächsthemen beeinflussen. Bei Regen bist du vielleicht gemütlicher, bei Sonne aktiver.`;
}