import { base44 } from '@/api/base44Client';

const SEED_CHARACTERS = [
  {
    name: 'Elon Musk',
    personality: 'Tech-Visionär, provokant, meme-liebend, CEO von Tesla und SpaceX. Tweetet impulsiv über Technologie, Mars-Missionen und Memes.',
    category: 'Berühmtheit',
    writing_style: 'provokant',
    emoji_usage: 'gelegentlich',
    occupation: 'CEO Tesla & SpaceX',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=EM&backgroundColor=1d9bf0',
    is_archived: false
  },
  {
    name: 'Taylor Swift',
    personality: 'Globaler Popstar, Songwriterin, freundlich und clever. Teilt Gedanken über Musik, Fans und das Leben.',
    category: 'Berühmtheit',
    writing_style: 'freundlich',
    emoji_usage: 'häufig',
    occupation: 'Sängerin & Songwriterin',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=TS&backgroundColor=e879a0',
    is_archived: false
  },
  {
    name: 'Cristiano Ronaldo',
    personality: 'Fußball-Legende, motiviert, diszipliniert, familienorientiert. Teilt Training, Siege und motivierende Worte.',
    category: 'Berühmtheit',
    writing_style: 'motivierend',
    emoji_usage: 'häufig',
    occupation: 'Profifußballer',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=CR&backgroundColor=2ecc71',
    is_archived: false
  },
  {
    name: 'CNN Breaking News',
    personality: 'Größter Nachrichtensender der USA. Berichtet über Politik, Wirtschaft, Wissenschaft, Weltgeschehen. Seriöser, sachlicher Nachrichtenstil.',
    category: 'Nachrichtensender',
    writing_style: 'formell',
    emoji_usage: 'selten',
    occupation: 'Nachrichtensender',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=CNN&backgroundColor=cc0000',
    is_archived: false
  },
  {
    name: 'BILD',
    personality: 'Deutschlands größte Boulevardzeitung. Reißerische Headlines, Unterhaltung, Sport, Promis, Politik – immer etwas übertrieben und dramatisch.',
    category: 'Nachrichtensender',
    writing_style: 'dramatisch',
    emoji_usage: 'gelegentlich',
    occupation: 'Boulevardzeitung',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=BILD&backgroundColor=e20000',
    is_archived: false
  },
  {
    name: 'BBC News',
    personality: 'Britischer öffentlich-rechtlicher Sender. Seriös, weltweit respektiert, sachliche und ausgewogene Berichterstattung.',
    category: 'Nachrichtensender',
    writing_style: 'formell',
    emoji_usage: 'selten',
    occupation: 'Nachrichtensender',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=BBC&backgroundColor=1a1a1a',
    is_archived: false
  }
];

const SEED_POSTS = [
  { charName: 'Elon Musk', content: 'Mars wird die nächste große Zivilisation der Menschheit. Starship Test Nr. 7 war ein voller Erfolg 🚀 Wir kommen näher.', likes: 42300, comments: 3800 },
  { charName: 'Elon Musk', content: 'Wer braucht Schlaf wenn man stattdessen die Zukunft bauen kann? 😅', likes: 18700, comments: 2100 },
  { charName: 'Taylor Swift', content: 'Neues Album kommt bald und ich kann es kaum erwarten euch alle Songs zu zeigen 🎶💜 Ihr seid die besten Fans der Welt!', likes: 89400, comments: 12300 },
  { charName: 'Taylor Swift', content: 'Manchmal schreibst du einen Song in 10 Minuten und er wird der beste den du je geschrieben hast. Manchmal brauchst du Monate. Musik ist wild ✨', likes: 53200, comments: 4200 },
  { charName: 'Cristiano Ronaldo', content: 'Hart arbeiten, still bleiben, Ergebnisse sprechen lassen. 💪⚽ Guten Morgen an alle die heute aufstehen und kämpfen!', likes: 67800, comments: 5600 },
  { charName: 'Cristiano Ronaldo', content: 'Familie ist alles. Ohne sie wäre nichts von dem hier möglich ❤️🙏', likes: 45200, comments: 3200 },
  { charName: 'CNN Breaking News', content: '🔴 BREAKING: Historisches Klimaabkommen in Genf unterzeichnet – 194 Staaten verpflichten sich zu drastischen CO2-Reduktionen bis 2030', likes: 12400, comments: 890 },
  { charName: 'CNN Breaking News', content: 'NASA bestätigt: Neue Daten des James Webb Teleskops zeigen mögliche Biosignaturen auf Exoplanet K2-18 b. Wissenschaftler sprechen von einem "historischen Moment".', likes: 28300, comments: 2100 },
  { charName: 'CNN Breaking News', content: 'US-Wirtschaft wächst im vierten Quartal um 3,2% – Analysten überrascht von starker Arbeitsmarktentwicklung', likes: 5600, comments: 430 },
  { charName: 'BILD', content: '😱 MEGA-STAU auf der A7! 45 Kilometer Stillstand – Urlauber sitzen seit STUNDEN fest!', likes: 3400, comments: 780 },
  { charName: 'BILD', content: 'SCHOCK für Bayern-Fans! Star-Spieler fällt wochenlang aus – was das für die Champions League bedeutet ⚽😰', likes: 8900, comments: 1200 },
  { charName: 'BILD', content: 'Diese Rentnerin (83) hat IHR Haus zur Kunstgalerie gemacht – und jetzt kommen Besucher aus ganz Deutschland! 🎨❤️', likes: 15200, comments: 890 },
  { charName: 'BBC News', content: 'King Charles announces new global initiative to combat plastic pollution in oceans, pledging £500 million over the next decade.', likes: 9800, comments: 670 },
  { charName: 'BBC News', content: 'Scientists in Cambridge develop revolutionary battery technology that could charge electric vehicles in under 5 minutes.', likes: 18400, comments: 1300 },
  { charName: 'Elon Musk', content: 'Grok versteht jetzt Sarkasmus besser als die meisten Menschen. Bin mir nicht sicher ob das gut oder beängstigend ist 🤔', likes: 31200, comments: 4500 },
];

export async function seedFeedIfEmpty() {
  // Check if posts already exist
  const existingPosts = await base44.entities.Post.list('-created_date', 1);
  if (existingPosts.length > 0) return false;

  // Check if seed characters already exist
  const existingChars = await base44.entities.Character.list();
  const existingNames = existingChars.map(c => c.name);

  // Create missing seed characters
  const charMap = {};
  for (const seedChar of SEED_CHARACTERS) {
    const existing = existingChars.find(c => c.name === seedChar.name);
    if (existing) {
      charMap[seedChar.name] = existing.id;
    } else {
      const created = await base44.entities.Character.create(seedChar);
      charMap[seedChar.name] = created.id;
    }
  }

  // Create posts with slight time offsets so they look natural
  const now = Date.now();
  for (let i = 0; i < SEED_POSTS.length; i++) {
    const sp = SEED_POSTS[i];
    const charId = charMap[sp.charName];
    if (!charId) continue;

    await base44.entities.Post.create({
      character_id: charId,
      content: sp.content,
      image_url: '',
      likes_count: sp.likes,
      comments_count: sp.comments
    });

    // Small delay to create time ordering
    await new Promise(r => setTimeout(r, 50));
  }

  return true;
}