// All shop item definitions for seeding

import { CHAT_THEMES } from './ChatThemes';

export const AVATAR_FRAMES = {
  frame_fire: { name: "🔥 Feuer-Rahmen", emoji: "🔥", css: "ring-2 ring-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)]", rarity: "rare", price: 200 },
  frame_ice: { name: "❄️ Eis-Rahmen", emoji: "❄️", css: "ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]", rarity: "rare", price: 200 },
  frame_gold: { name: "👑 Gold-Rahmen", emoji: "👑", css: "ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]", rarity: "legendary", price: 500 },
  frame_emerald: { name: "💚 Smaragd-Rahmen", emoji: "💚", css: "ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]", rarity: "epic", price: 300 },
  frame_rainbow: { name: "🌈 Regenbogen-Rahmen", emoji: "🌈", css: "ring-2 ring-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)] animate-pulse", rarity: "legendary", price: 600 },
  frame_purple: { name: "💜 Amethyst-Rahmen", emoji: "💜", css: "ring-2 ring-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.5)]", rarity: "epic", price: 300 },
  frame_rose: { name: "🌹 Rosen-Rahmen", emoji: "🌹", css: "ring-2 ring-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.5)]", rarity: "rare", price: 200 },
  frame_lightning: { name: "⚡ Blitz-Rahmen", emoji: "⚡", css: "ring-2 ring-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.6)]", rarity: "epic", price: 350 },
};

export const CHAT_BUBBLES = {
  bubble_rounded: { name: "🫧 Abgerundet", emoji: "🫧", css: "rounded-3xl", rarity: "common", price: 100 },
  bubble_sharp: { name: "📐 Kantig", emoji: "📐", css: "rounded-md", rarity: "common", price: 100 },
  bubble_gradient_blue: { name: "💙 Blau-Verlauf", emoji: "💙", css: "bg-gradient-to-r from-blue-600 to-cyan-600", rarity: "rare", price: 250 },
  bubble_gradient_pink: { name: "💗 Pink-Verlauf", emoji: "💗", css: "bg-gradient-to-r from-pink-600 to-rose-600", rarity: "rare", price: 250 },
  bubble_gradient_galaxy: { name: "🌌 Galaxie-Verlauf", emoji: "🌌", css: "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600", rarity: "epic", price: 400 },
  bubble_glass: { name: "🪟 Glas-Effekt", emoji: "🪟", css: "bg-white/10 backdrop-blur-md border border-white/20", rarity: "epic", price: 350 },
};

export const NAME_COLORS = {
  name_red: { name: "🔴 Rot", emoji: "🔴", css: "text-red-400", rarity: "common", price: 80 },
  name_blue: { name: "🔵 Blau", emoji: "🔵", css: "text-blue-400", rarity: "common", price: 80 },
  name_gold: { name: "🟡 Gold", emoji: "🟡", css: "text-yellow-400", rarity: "rare", price: 150 },
  name_pink: { name: "🩷 Pink", emoji: "🩷", css: "text-pink-400", rarity: "common", price: 80 },
  name_gradient_fire: { name: "🔥 Feuer-Gradient", emoji: "🔥", css: "bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent", rarity: "epic", price: 300 },
  name_gradient_ocean: { name: "🌊 Ozean-Gradient", emoji: "🌊", css: "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent", rarity: "epic", price: 300 },
  name_gradient_galaxy: { name: "✨ Galaxie-Gradient", emoji: "✨", css: "bg-gradient-to-r from-purple-400 via-pink-400 to-violet-500 bg-clip-text text-transparent", rarity: "legendary", price: 500 },
  name_rainbow: { name: "🌈 Regenbogen", emoji: "🌈", css: "bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent", rarity: "legendary", price: 600 },
};

export const PREMIUM_GIFTS = {
  gift_diamond_ring: { name: "💍 Diamant-Ring", emoji: "💍", rarity: "legendary", price: 800 },
  gift_vacation: { name: "🏝️ Urlaubsreise", emoji: "🏝️", rarity: "legendary", price: 700 },
  gift_sports_car: { name: "🏎️ Sportwagen", emoji: "🏎️", rarity: "legendary", price: 1000 },
  gift_castle: { name: "🏰 Schloss", emoji: "🏰", rarity: "legendary", price: 1500 },
  gift_yacht: { name: "🛥️ Yacht", emoji: "🛥️", rarity: "epic", price: 900 },
  gift_star: { name: "⭐ Stern benennen", emoji: "⭐", rarity: "epic", price: 500 },
  gift_puppy: { name: "🐕 Welpe", emoji: "🐕", rarity: "epic", price: 400 },
  gift_kitten: { name: "🐈 Kätzchen", emoji: "🐈", rarity: "epic", price: 400 },
  gift_concert_ticket: { name: "🎫 Konzerttickets", emoji: "🎫", rarity: "rare", price: 300 },
  gift_painting: { name: "🖼️ Gemälde", emoji: "🖼️", rarity: "rare", price: 250 },
  gift_moonlight_dinner: { name: "🕯️ Candlelight-Dinner", emoji: "🕯️", rarity: "rare", price: 200 },
  gift_love_letter: { name: "💌 Liebesbrief", emoji: "💌", rarity: "common", price: 50 },
};

export const VOICE_EFFECTS = {
  voice_poet: { name: "🎭 Poetisch", emoji: "🎭", prompt: "Antworte in einem poetischen, lyrischen Stil mit blumiger Sprache und Metaphern.", rarity: "rare", price: 200 },
  voice_dramatic: { name: "🎬 Dramatisch", emoji: "🎬", prompt: "Antworte übertrieben dramatisch, wie in einem Hollywood-Film, mit großen Emotionen.", rarity: "rare", price: 200 },
  voice_uwu: { name: "🥺 UwU", emoji: "🥺", prompt: "Antworte im süßen UwU-Stil mit Verniedlichungen, Kaomojis und verspielter Sprache.", rarity: "common", price: 150 },
  voice_pirate: { name: "🏴‍☠️ Pirat", emoji: "🏴‍☠️", prompt: "Antworte wie ein Pirat mit 'Arrr', Seemannssprache und Abenteuergeist.", rarity: "rare", price: 200 },
  voice_shakespeare: { name: "📜 Shakespeare", emoji: "📜", prompt: "Antworte im Stil von Shakespeare mit altertümlicher, blumiger Sprache und Zitaten.", rarity: "epic", price: 350 },
  voice_rapper: { name: "🎤 Rapper", emoji: "🎤", prompt: "Antworte im Rapper/Hip-Hop-Stil mit Reimen, Slang und Attitude.", rarity: "epic", price: 350 },
  voice_noir: { name: "🕵️ Film Noir", emoji: "🕵️", prompt: "Antworte wie ein Detektiv aus einem alten Film Noir – düster, nachdenklich, zynisch.", rarity: "epic", price: 300 },
  voice_anime: { name: "⚔️ Anime", emoji: "⚔️", prompt: "Antworte wie ein Anime-Charakter mit japanischen Einwürfen, dramatischen Pausen und Shōnen-Energie.", rarity: "rare", price: 250 },
};

export const XP_BOOSTS = {
  boost_2x_24h: { name: "⚡ 2x XP (24h)", emoji: "⚡", duration: 24, multiplier: 2, rarity: "rare", price: 200 },
  boost_3x_1h: { name: "🚀 3x XP (1h)", emoji: "🚀", duration: 1, multiplier: 3, rarity: "epic", price: 150 },
};

export const PROFILE_BADGES = {
  badge_crown: { name: "👑 Krone", emoji: "👑", rarity: "legendary", price: 500 },
  badge_star: { name: "⭐ Stern", emoji: "⭐", rarity: "epic", price: 300 },
  badge_heart: { name: "❤️ Herz", emoji: "❤️", rarity: "rare", price: 150 },
  badge_fire: { name: "🔥 Feuer", emoji: "🔥", rarity: "rare", price: 150 },
  badge_diamond: { name: "💎 Diamant", emoji: "💎", rarity: "epic", price: 350 },
  badge_magic: { name: "🪄 Magie", emoji: "🪄", rarity: "epic", price: 300 },
};

export function getAllShopItems() {
  const items = [];

  // Chat Themes
  const themeRarityPrice = {
    sunset: { rarity: 'rare', price: 150 },
    ocean: { rarity: 'common', price: 100 },
    forest: { rarity: 'common', price: 100 },
    galaxy: { rarity: 'epic', price: 300 },
    cherry: { rarity: 'rare', price: 150 },
    neon: { rarity: 'epic', price: 300 },
    fire: { rarity: 'rare', price: 150 },
    arctic: { rarity: 'common', price: 100 },
    midnight: { rarity: 'rare', price: 150 },
    gold: { rarity: 'legendary', price: 500 },
    pastel_pink: { rarity: 'common', price: 100 },
    pastel_blue: { rarity: 'common', price: 100 },
    pastel_green: { rarity: 'common', price: 100 },
    pastel_lilac: { rarity: 'common', price: 120 },
    pastel_peach: { rarity: 'common', price: 100 },
    pastel_rainbow: { rarity: 'rare', price: 200 },
    cyberpunk: { rarity: 'epic', price: 350 },
    blood_moon: { rarity: 'epic', price: 300 },
    lavender_dream: { rarity: 'rare', price: 180 },
    tropical: { rarity: 'rare', price: 200 },
    cotton_candy: { rarity: 'rare', price: 180 },
    dark_emerald: { rarity: 'rare', price: 180 },
    rose_gold: { rarity: 'epic', price: 300 },
    storm: { rarity: 'rare', price: 150 },
    aurora: { rarity: 'legendary', price: 500 },
    vintage: { rarity: 'rare', price: 200 },
    monochrome: { rarity: 'common', price: 120 },
    sakura: { rarity: 'epic', price: 300 },
    deep_space: { rarity: 'epic', price: 350 },
    candy_pop: { rarity: 'rare', price: 200 },
    matrix: { rarity: 'epic', price: 300 },
    ocean_breeze: { rarity: 'rare', price: 180 },
    dark_rose: { rarity: 'epic', price: 280 },
  };

  Object.entries(CHAT_THEMES)
    .filter(([key]) => key !== 'default')
    .forEach(([key, theme]) => {
      const tp = themeRarityPrice[key] || { rarity: 'common', price: 100 };
      items.push({
        item_key: `theme_${key}`,
        name: theme.name,
        description: `Chat-Hintergrund: ${theme.name}`,
        category: 'chat_theme',
        price: tp.price,
        rarity: tp.rarity,
        is_active: true,
        meta: JSON.stringify({ bg: theme.bg, messageBg: theme.messageBg, userBg: theme.userBg, themeKey: key })
      });
    });

  // Avatar Frames
  Object.entries(AVATAR_FRAMES).forEach(([key, frame]) => {
    items.push({
      item_key: key, name: frame.name, emoji: frame.emoji,
      description: "Animierter Rahmen um deinen Charakter-Avatar",
      category: 'avatar_frame', price: frame.price, rarity: frame.rarity, is_active: true,
      meta: JSON.stringify({ css: frame.css })
    });
  });

  // Chat Bubbles
  Object.entries(CHAT_BUBBLES).forEach(([key, bubble]) => {
    items.push({
      item_key: key, name: bubble.name, emoji: bubble.emoji,
      description: "Ändert den Stil deiner Chat-Blasen",
      category: 'chat_bubble', price: bubble.price, rarity: bubble.rarity, is_active: true,
      meta: JSON.stringify({ css: bubble.css })
    });
  });

  // Name Colors
  Object.entries(NAME_COLORS).forEach(([key, nc]) => {
    items.push({
      item_key: key, name: nc.name, emoji: nc.emoji,
      description: "Dein Name erscheint in dieser Farbe im Chat",
      category: 'name_color', price: nc.price, rarity: nc.rarity, is_active: true,
      meta: JSON.stringify({ css: nc.css })
    });
  });

  // Premium Gifts
  Object.entries(PREMIUM_GIFTS).forEach(([key, gift]) => {
    items.push({
      item_key: key, name: gift.name, emoji: gift.emoji,
      description: "Exklusives Geschenk für deinen Charakter",
      category: 'premium_gift', price: gift.price, rarity: gift.rarity, is_active: true,
      meta: JSON.stringify({})
    });
  });

  // Voice Effects
  Object.entries(VOICE_EFFECTS).forEach(([key, ve]) => {
    items.push({
      item_key: key, name: ve.name, emoji: ve.emoji,
      description: "Ändert den Sprachstil deines Charakters",
      category: 'voice_effect', price: ve.price, rarity: ve.rarity, is_active: true,
      meta: JSON.stringify({ prompt: ve.prompt })
    });
  });

  // XP Boosts
  Object.entries(XP_BOOSTS).forEach(([key, boost]) => {
    items.push({
      item_key: key, name: boost.name, emoji: boost.emoji,
      description: `${boost.multiplier}x XP für ${boost.duration} Stunde(n)`,
      category: 'xp_boost', price: boost.price, rarity: boost.rarity, is_active: true,
      meta: JSON.stringify({ duration: boost.duration, multiplier: boost.multiplier })
    });
  });

  // Profile Badges
  Object.entries(PROFILE_BADGES).forEach(([key, badge]) => {
    items.push({
      item_key: key, name: badge.name, emoji: badge.emoji,
      description: "Zeige dieses Badge auf deinem Profil",
      category: 'profile_badge', price: badge.price, rarity: badge.rarity, is_active: true,
      meta: JSON.stringify({})
    });
  });

  return items;
}