// Helper: light themes need dark text, dark header/input bars matching the theme
const DARK_DEFAULTS = { isLight: false, headerBg: "bg-[#1a1a1a]", inputBg: "bg-[#1a1a1a]", msgText: "text-gray-100", timeText: "text-gray-500" };

// Vordefinierte Chat-Themes
export const CHAT_THEMES = {
  default: {
    name: "Standard",
    bg: "bg-[#111]",
    messageBg: "bg-[#262626]",
    userBg: "bg-emerald-600",
    css: "",
    free: true,
    ...DARK_DEFAULTS
  },
  sunset: {
    name: "🌅 Sonnenuntergang",
    bg: "bg-gradient-to-b from-orange-950 via-rose-950 to-purple-950",
    messageBg: "bg-white/10",
    userBg: "bg-orange-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-orange-950/90", inputBg: "bg-orange-950/90"
  },
  ocean: {
    name: "🌊 Ozean",
    bg: "bg-gradient-to-b from-cyan-950 via-blue-950 to-slate-950",
    messageBg: "bg-white/10",
    userBg: "bg-cyan-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-cyan-950/90", inputBg: "bg-cyan-950/90"
  },
  forest: {
    name: "🌲 Wald",
    bg: "bg-gradient-to-b from-green-950 via-emerald-950 to-slate-950",
    messageBg: "bg-white/10",
    userBg: "bg-green-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-green-950/90", inputBg: "bg-green-950/90"
  },
  galaxy: {
    name: "🌌 Galaxie",
    bg: "bg-gradient-to-b from-violet-950 via-indigo-950 to-slate-950",
    messageBg: "bg-white/10",
    userBg: "bg-violet-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-violet-950/90", inputBg: "bg-violet-950/90"
  },
  cherry: {
    name: "🌸 Kirschblüte",
    bg: "bg-gradient-to-b from-pink-950 via-rose-950 to-slate-950",
    messageBg: "bg-white/10",
    userBg: "bg-pink-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-pink-950/90", inputBg: "bg-pink-950/90"
  },
  neon: {
    name: "💜 Neon",
    bg: "bg-gradient-to-b from-fuchsia-950 via-purple-950 to-black",
    messageBg: "bg-fuchsia-500/10",
    userBg: "bg-fuchsia-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-fuchsia-950/90", inputBg: "bg-fuchsia-950/90"
  },
  fire: {
    name: "🔥 Feuer",
    bg: "bg-gradient-to-b from-red-950 via-orange-950 to-black",
    messageBg: "bg-red-500/10",
    userBg: "bg-red-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-red-950/90", inputBg: "bg-red-950/90"
  },
  arctic: {
    name: "❄️ Arktis",
    bg: "bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950",
    messageBg: "bg-sky-500/10",
    userBg: "bg-sky-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-sky-950/90", inputBg: "bg-sky-950/90"
  },
  midnight: {
    name: "🌙 Mitternacht",
    bg: "bg-gradient-to-b from-slate-900 via-indigo-950 to-black",
    messageBg: "bg-indigo-500/10",
    userBg: "bg-indigo-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-indigo-950/90", inputBg: "bg-indigo-950/90"
  },
  gold: {
    name: "👑 Gold",
    bg: "bg-gradient-to-b from-yellow-950 via-amber-950 to-black",
    messageBg: "bg-yellow-500/10",
    userBg: "bg-amber-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-yellow-950/90", inputBg: "bg-yellow-950/90"
  },
  // Pastell-Themes (LIGHT)
  pastel_pink: {
    name: "🩷 Pastell Rosa",
    bg: "bg-gradient-to-b from-pink-200 via-pink-100 to-rose-50",
    messageBg: "bg-white/70",
    userBg: "bg-pink-400",
    css: "",
    isLight: true, headerBg: "bg-pink-200/90", inputBg: "bg-pink-200/90", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  pastel_blue: {
    name: "🩵 Pastell Blau",
    bg: "bg-gradient-to-b from-sky-200 via-blue-100 to-cyan-50",
    messageBg: "bg-white/70",
    userBg: "bg-sky-400",
    css: "",
    isLight: true, headerBg: "bg-sky-200/90", inputBg: "bg-sky-200/90", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  pastel_green: {
    name: "🍀 Pastell Grün",
    bg: "bg-gradient-to-b from-emerald-200 via-green-100 to-lime-50",
    messageBg: "bg-white/70",
    userBg: "bg-emerald-400",
    css: "",
    isLight: true, headerBg: "bg-emerald-200/90", inputBg: "bg-emerald-200/90", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  pastel_lilac: {
    name: "💜 Pastell Lila",
    bg: "bg-gradient-to-b from-violet-200 via-purple-100 to-fuchsia-50",
    messageBg: "bg-white/70",
    userBg: "bg-violet-400",
    css: "",
    isLight: true, headerBg: "bg-violet-200/90", inputBg: "bg-violet-200/90", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  pastel_peach: {
    name: "🍑 Pastell Pfirsich",
    bg: "bg-gradient-to-b from-orange-200 via-amber-100 to-yellow-50",
    messageBg: "bg-white/70",
    userBg: "bg-orange-400",
    css: "",
    isLight: true, headerBg: "bg-orange-200/90", inputBg: "bg-orange-200/90", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  pastel_rainbow: {
    name: "🌈 Pastell Regenbogen",
    bg: "bg-gradient-to-br from-pink-200 via-yellow-100 via-green-100 to-blue-200",
    messageBg: "bg-white/60",
    userBg: "bg-pink-400",
    css: "",
    isLight: true, headerBg: "bg-pink-200/80", inputBg: "bg-blue-200/80", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  // Muster / Pattern Themes
  cyberpunk: {
    name: "🤖 Cyberpunk",
    bg: "bg-gradient-to-b from-yellow-400 via-pink-600 to-violet-900",
    messageBg: "bg-black/40",
    userBg: "bg-yellow-500",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-violet-900/90", inputBg: "bg-violet-900/90"
  },
  blood_moon: {
    name: "🩸 Blutmond",
    bg: "bg-gradient-to-b from-red-900 via-red-950 to-black",
    messageBg: "bg-red-900/30",
    userBg: "bg-red-700",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-red-950/90", inputBg: "bg-red-950/90"
  },
  lavender_dream: {
    name: "💐 Lavendel-Traum",
    bg: "bg-gradient-to-b from-purple-300 via-violet-200 to-indigo-100",
    messageBg: "bg-white/60",
    userBg: "bg-purple-500",
    css: "",
    isLight: true, headerBg: "bg-purple-300/90", inputBg: "bg-purple-300/90", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  tropical: {
    name: "🌴 Tropical",
    bg: "bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600",
    messageBg: "bg-black/20",
    userBg: "bg-teal-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-teal-700/90", inputBg: "bg-teal-700/90"
  },
  cotton_candy: {
    name: "🍬 Zuckerwatte",
    bg: "bg-gradient-to-br from-pink-300 via-purple-200 to-blue-300",
    messageBg: "bg-white/50",
    userBg: "bg-pink-500",
    css: "",
    isLight: true, headerBg: "bg-pink-300/90", inputBg: "bg-blue-300/90", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  dark_emerald: {
    name: "🐉 Dunkler Smaragd",
    bg: "bg-gradient-to-b from-emerald-950 via-green-950 to-black",
    messageBg: "bg-emerald-500/10",
    userBg: "bg-emerald-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-emerald-950/90", inputBg: "bg-emerald-950/90"
  },
  rose_gold: {
    name: "✨ Roségold",
    bg: "bg-gradient-to-b from-rose-300 via-amber-200 to-yellow-100",
    messageBg: "bg-white/50",
    userBg: "bg-rose-500",
    css: "",
    isLight: true, headerBg: "bg-rose-300/90", inputBg: "bg-rose-300/90", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  storm: {
    name: "⛈️ Gewitter",
    bg: "bg-gradient-to-b from-slate-800 via-gray-900 to-zinc-950",
    messageBg: "bg-slate-500/15",
    userBg: "bg-slate-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-slate-800/90", inputBg: "bg-slate-800/90"
  },
  aurora: {
    name: "🌌 Nordlicht",
    bg: "bg-gradient-to-br from-green-400 via-cyan-500 to-purple-600",
    messageBg: "bg-black/30",
    userBg: "bg-cyan-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-purple-800/90", inputBg: "bg-purple-800/90"
  },
  vintage: {
    name: "📜 Vintage",
    bg: "bg-gradient-to-b from-amber-100 via-orange-50 to-yellow-50",
    messageBg: "bg-amber-900/10",
    userBg: "bg-amber-700",
    css: "",
    isLight: true, headerBg: "bg-amber-200/90", inputBg: "bg-amber-200/90", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  monochrome: {
    name: "⬛ Monochrom",
    bg: "bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-950",
    messageBg: "bg-neutral-700/50",
    userBg: "bg-neutral-600",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-neutral-900/90", inputBg: "bg-neutral-900/90"
  },
  sakura: {
    name: "🌸 Sakura Deluxe",
    bg: "bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300",
    messageBg: "bg-white/60",
    userBg: "bg-rose-500",
    css: "",
    isLight: true, headerBg: "bg-pink-300/90", inputBg: "bg-pink-300/90", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  deep_space: {
    name: "🚀 Deep Space",
    bg: "bg-gradient-to-b from-black via-indigo-950 to-violet-950",
    messageBg: "bg-indigo-500/10",
    userBg: "bg-indigo-700",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-indigo-950/90", inputBg: "bg-indigo-950/90"
  },
  candy_pop: {
    name: "🍭 Candy Pop",
    bg: "bg-gradient-to-br from-fuchsia-400 via-pink-300 to-orange-300",
    messageBg: "bg-white/40",
    userBg: "bg-fuchsia-500",
    css: "",
    isLight: true, headerBg: "bg-fuchsia-400/80", inputBg: "bg-orange-300/80", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  matrix: {
    name: "💚 Matrix",
    bg: "bg-gradient-to-b from-black via-green-950 to-black",
    messageBg: "bg-green-500/10",
    userBg: "bg-green-700",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-green-950/90", inputBg: "bg-green-950/90"
  },
  ocean_breeze: {
    name: "🐚 Meeresbrise",
    bg: "bg-gradient-to-b from-cyan-200 via-blue-100 to-teal-50",
    messageBg: "bg-white/60",
    userBg: "bg-cyan-500",
    css: "",
    isLight: true, headerBg: "bg-cyan-200/90", inputBg: "bg-cyan-200/90", msgText: "text-gray-800", timeText: "text-gray-500"
  },
  dark_rose: {
    name: "🥀 Dunkle Rose",
    bg: "bg-gradient-to-b from-rose-950 via-pink-950 to-black",
    messageBg: "bg-rose-500/10",
    userBg: "bg-rose-700",
    css: "",
    ...DARK_DEFAULTS, headerBg: "bg-rose-950/90", inputBg: "bg-rose-950/90"
  }
};

export function getThemeClasses(themeKey) {
  return CHAT_THEMES[themeKey] || CHAT_THEMES.default;
}