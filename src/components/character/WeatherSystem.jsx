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

// Seasonal weather probabilities (month-based)
function getSeasonalWeather() {
  const month = new Date().getMonth();
  const hour = new Date().getHours();
  
  let weights;
  if (month >= 2 && month <= 4) { // Frühling
    weights = { sonnig: 25, heiter: 25, bewölkt: 20, regen: 20, windig: 10 };
  } else if (month >= 5 && month <= 7) { // Sommer
    weights = { sonnig: 40, heiter: 25, bewölkt: 10, regen: 10, gewitter: 10, windig: 5 };
  } else if (month >= 8 && month <= 10) { // Herbst
    weights = { bewölkt: 25, regen: 25, nebel: 15, windig: 15, heiter: 15, sonnig: 5 };
  } else { // Winter
    weights = { bewölkt: 25, schnee: 20, nebel: 15, regen: 15, heiter: 15, sonnig: 10 };
  }

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

function getTemperature() {
  const month = new Date().getMonth();
  const hour = new Date().getHours();
  const baseTempByMonth = [-2, 0, 5, 10, 15, 20, 23, 22, 18, 12, 6, 1];
  let temp = baseTempByMonth[month];
  
  // Day/night variation
  if (hour >= 12 && hour <= 16) temp += 3;
  else if (hour >= 22 || hour < 6) temp -= 4;
  
  // Random variation
  temp += Math.round((Math.random() - 0.5) * 6);
  return temp;
}

export async function updateWeatherState(userEmail) {
  const existing = await base44.entities.WeatherState.filter({ user_email: userEmail }, '-created_date', 1);
  const now = new Date();
  
  // Update every 3 hours
  if (existing[0]) {
    const lastUpdate = new Date(existing[0].last_updated || existing[0].created_date);
    const hoursSince = (now - lastUpdate) / (1000 * 60 * 60);
    if (hoursSince < 3) return existing[0];
  }

  const weather = getSeasonalWeather();
  const temperature = getTemperature();
  
  const data = {
    user_email: userEmail,
    weather,
    temperature,
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
  
  return `\n\nWETTER: Es ist gerade ${data.label} (${data.emoji}), ${weatherState.temperature}°C. Das Wetter kann deine Stimmung und Gesprächsthemen beeinflussen. Bei Regen bist du vielleicht gemütlicher, bei Sonne aktiver.`;
}