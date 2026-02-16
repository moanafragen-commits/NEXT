// Vordefinierte Chat-Themes
export const CHAT_THEMES = {
  default: {
    name: "Standard",
    bg: "bg-[#111]",
    messageBg: "bg-[#262626]",
    userBg: "bg-emerald-600",
    css: "",
    free: true
  },
  sunset: {
    name: "🌅 Sonnenuntergang",
    bg: "bg-gradient-to-b from-orange-950 via-rose-950 to-purple-950",
    messageBg: "bg-white/10",
    userBg: "bg-orange-600",
    css: ""
  },
  ocean: {
    name: "🌊 Ozean",
    bg: "bg-gradient-to-b from-cyan-950 via-blue-950 to-slate-950",
    messageBg: "bg-white/10",
    userBg: "bg-cyan-600",
    css: ""
  },
  forest: {
    name: "🌲 Wald",
    bg: "bg-gradient-to-b from-green-950 via-emerald-950 to-slate-950",
    messageBg: "bg-white/10",
    userBg: "bg-green-600",
    css: ""
  },
  galaxy: {
    name: "🌌 Galaxie",
    bg: "bg-gradient-to-b from-violet-950 via-indigo-950 to-slate-950",
    messageBg: "bg-white/10",
    userBg: "bg-violet-600",
    css: ""
  },
  cherry: {
    name: "🌸 Kirschblüte",
    bg: "bg-gradient-to-b from-pink-950 via-rose-950 to-slate-950",
    messageBg: "bg-white/10",
    userBg: "bg-pink-600",
    css: ""
  },
  neon: {
    name: "💜 Neon",
    bg: "bg-gradient-to-b from-fuchsia-950 via-purple-950 to-black",
    messageBg: "bg-fuchsia-500/10",
    userBg: "bg-fuchsia-600",
    css: ""
  },
  fire: {
    name: "🔥 Feuer",
    bg: "bg-gradient-to-b from-red-950 via-orange-950 to-black",
    messageBg: "bg-red-500/10",
    userBg: "bg-red-600",
    css: ""
  },
  arctic: {
    name: "❄️ Arktis",
    bg: "bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950",
    messageBg: "bg-sky-500/10",
    userBg: "bg-sky-600",
    css: ""
  },
  midnight: {
    name: "🌙 Mitternacht",
    bg: "bg-gradient-to-b from-slate-900 via-indigo-950 to-black",
    messageBg: "bg-indigo-500/10",
    userBg: "bg-indigo-600",
    css: ""
  },
  gold: {
    name: "👑 Gold",
    bg: "bg-gradient-to-b from-yellow-950 via-amber-950 to-black",
    messageBg: "bg-yellow-500/10",
    userBg: "bg-amber-600",
    css: ""
  }
};

export function getThemeClasses(themeKey) {
  return CHAT_THEMES[themeKey] || CHAT_THEMES.default;
}