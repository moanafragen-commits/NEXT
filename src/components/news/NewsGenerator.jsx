import { base44 } from '@/api/base44Client';

const NEWS_CATEGORIES = ['entertainment', 'sport', 'klatsch', 'gaming', 'musik', 'wissenschaft'];

export async function generateNews(userEmail, characters) {
  // Check if news exists today
  const existing = await base44.entities.NewsArticle.filter({ user_email: userEmail }, '-created_date', 5);
  if (existing.length > 0) {
    const lastDate = new Date(existing[0].created_date).toDateString();
    if (lastDate === new Date().toDateString()) return existing;
  }

  const charNames = characters.slice(0, 5).map(c => `${c.name} (${c.category || 'Charakter'})`).join(', ');
  const category = NEWS_CATEGORIES[Math.floor(Math.random() * NEWS_CATEGORIES.length)];

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Generiere eine fiktive In-Game Nachricht für eine Social-Media-Welt.
Bekannte Personen in dieser Welt: ${charNames}

Kategorie: ${category}
Erstelle eine witzige, dramatische oder überraschende Nachricht die in diese Welt passt.
Die Nachricht sollte kurz und knackig sein wie eine Push-Benachrichtigung.`,
    response_json_schema: {
      type: "object",
      properties: {
        headline: { type: "string" },
        content: { type: "string" },
        emoji: { type: "string" },
        related_character_name: { type: "string" }
      }
    }
  });

  const relatedChar = characters.find(c => result.related_character_name && c.name.includes(result.related_character_name));

  const article = await base44.entities.NewsArticle.create({
    user_email: userEmail,
    headline: result.headline,
    content: result.content,
    category,
    emoji: result.emoji || '📰',
    related_character_ids: relatedChar ? relatedChar.id : ''
  });

  return [article, ...existing];
}

export function getNewsContext(articles) {
  if (!articles || articles.length === 0) return '';
  const latest = articles[0];
  return `\n\n📰 AKTUELLE NACHRICHT: "${latest.headline}" - ${latest.content}. Du kannst das beiläufig erwähnen wenn es passt.`;
}