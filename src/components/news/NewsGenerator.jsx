import { base44 } from '@/api/base44Client';

const NEWS_CATEGORIES = ['entertainment', 'sport', 'klatsch', 'gaming', 'musik', 'wissenschaft'];

export async function generateNews(userEmail, characters) {
  // Check if news exists today
  const existing = await base44.entities.NewsArticle.filter({ user_email: userEmail }, '-created_date', 10);
  if (existing.length > 0) {
    const lastDate = new Date(existing[0].created_date).toDateString();
    if (lastDate === new Date().toDateString()) return existing;
  }

  // Pick 2-4 characters to feature in the news
  const shuffled = [...characters].sort(() => Math.random() - 0.5);
  const featured = shuffled.slice(0, Math.min(4, characters.length));
  const charDescriptions = featured.map(c => {
    const parts = [c.name];
    if (c.occupation) parts.push(`Beruf: ${c.occupation}`);
    if (c.category) parts.push(`Typ: ${c.category}`);
    if (c.interests) parts.push(`Interessen: ${c.interests.slice(0, 80)}`);
    if (c.biography) parts.push(`Bio: ${c.biography.slice(0, 100)}`);
    return parts.join(', ');
  }).join('\n');

  const category = NEWS_CATEGORIES[Math.floor(Math.random() * NEWS_CATEGORIES.length)];

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Generiere 2-3 fiktive News-Artikel für eine Social-Media-Welt. Die Charaktere sind ECHTE Personen in dieser Welt und verfolgen aktiv die Medien.

BEKANNTE PERSONEN:
${charDescriptions}

Kategorie: ${category}

REGELN:
- Mindestens 1 Artikel MUSS einen der Charaktere direkt betreffen (z.B. Gerüchte, Interview, Skandal, neues Projekt, Sichtung, Social-Media-Post)
- Die Artikel sollen realistisch wirken wie echte Promi-News / Branchen-News
- Kurz und knackig wie Push-Benachrichtigungen / Schlagzeilen
- Nutze die Biografie und den Beruf der Charaktere für realistische Geschichten
- Manche Artikel können auch FALSCHE Gerüchte sein oder Klatsch enthalten`,
    response_json_schema: {
      type: "object",
      properties: {
        articles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              headline: { type: "string" },
              content: { type: "string", description: "2-3 Sätze Inhalt" },
              emoji: { type: "string" },
              category: { type: "string", enum: NEWS_CATEGORIES },
              related_character_name: { type: "string", description: "Name des betroffenen Charakters, leer wenn keiner direkt betroffen" },
              is_rumor: { type: "boolean", description: "Ob es ein Gerücht/unbestätigter Bericht ist" }
            }
          }
        }
      }
    }
  });

  const newArticles = [];
  for (const a of (result.articles || [result])) {
    const relatedChar = characters.find(c => a.related_character_name && c.name.toLowerCase().includes(a.related_character_name.toLowerCase()));
    const article = await base44.entities.NewsArticle.create({
      user_email: userEmail,
      headline: a.headline || 'Breaking News',
      content: a.content || '',
      category: a.category || category,
      emoji: a.emoji || '📰',
      related_character_ids: relatedChar ? relatedChar.id : '',
      likes: [],
      comments: []
    });
    newArticles.push(article);
  }

  // Generate AI reactions (likes + comments) for all new articles
  await generateArticleReactions(newArticles, characters);

  // Refetch with reactions
  const updated = await base44.entities.NewsArticle.filter({ user_email: userEmail }, '-created_date', 20);
  return updated;
}

// Build news context for a SPECIFIC character – they know what's reported about them
export function getNewsContextForCharacter(articles, characterId, characterName) {
  if (!articles || articles.length === 0) return '';

  const parts = [];

  // Articles about THIS character
  const aboutMe = articles.filter(a => a.related_character_ids && a.related_character_ids.includes(characterId));
  if (aboutMe.length > 0) {
    parts.push('\n\n📰 MEDIENBERICHTE ÜBER DICH (du verfolgst die Nachrichten aktiv!):');
    for (const a of aboutMe.slice(0, 3)) {
      parts.push(`- "${a.headline}": ${a.content}`);
    }
    parts.push('→ Du WEISST von diesen Berichten! Reagiere darauf: Sei genervt von falschen Gerüchten, stolz auf positive Presse, besorgt über Skandale. Erwähne es wenn es passt, z.B. "Hast du gesehen was die über mich schreiben?" oder "Die Medien drehen wieder durch..."');
  }

  // General news the character would have seen
  const otherNews = articles.filter(a => !a.related_character_ids || !a.related_character_ids.includes(characterId)).slice(0, 2);
  if (otherNews.length > 0) {
    parts.push('\n📱 AKTUELLE NACHRICHTEN (du hast diese News gesehen):');
    for (const a of otherNews) {
      parts.push(`- "${a.headline}": ${a.content}`);
    }
    parts.push('→ Du kannst diese News beiläufig erwähnen wenn es zum Gespräch passt, wie ein echter Mensch der Nachrichten liest.');
  }

  return parts.join('\n');
}

// Generate AI likes & comments for articles
async function generateArticleReactions(articles, characters) {
  if (!articles.length || characters.length < 2) return;

  const charList = characters.slice(0, 15).map(c => 
    `- ${c.name} (ID: ${c.id}): ${c.personality?.slice(0, 60) || 'Keine Beschreibung'}${c.occupation ? `, Beruf: ${c.occupation}` : ''}`
  ).join('\n');

  const articleList = articles.map((a, i) => 
    `Artikel ${i}: "${a.headline}" – ${a.content}`
  ).join('\n');

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `Mehrere News-Artikel wurden veröffentlicht. Die Charaktere können darauf reagieren (liken & kommentieren).

ARTIKEL:
${articleList}

CHARAKTERE:
${charList}

REGELN:
- Jeder Charakter kann 0-2 Artikel liken (passend zu ihrer Persönlichkeit/Interessen)
- Pro Artikel sollen 1-4 Charaktere kommentieren (kurz, natürlich, in character)
- Betroffene Charaktere MÜSSEN auf ihren eigenen Artikel reagieren (genervt, stolz, etc.)
- Kommentare sollen wie echte Social-Media-Kommentare klingen (kurz, mit Emojis)
- Manche Charaktere können sarkastisch, andere supportive sein`,
    response_json_schema: {
      type: "object",
      properties: {
        article_reactions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              article_index: { type: "number" },
              likes: { type: "array", items: { type: "string" }, description: "Character-IDs die liken" },
              comments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    character_id: { type: "string" },
                    content: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const now = new Date().toISOString();
  for (const r of (response.article_reactions || [])) {
    const article = articles[r.article_index];
    if (!article) continue;

    const likeIds = (r.likes || []).filter(id => characters.some(c => c.id === id));
    const likeNames = likeIds.map(id => characters.find(c => c.id === id)?.name).filter(Boolean).join(', ');
    const commentsList = (r.comments || []).map(cm => {
      const char = characters.find(c => c.id === cm.character_id);
      if (!char) return null;
      return {
        character_id: cm.character_id,
        character_name: char.name,
        avatar_url: char.avatar_url || '',
        content: cm.content,
        timestamp: now
      };
    }).filter(Boolean);

    await base44.entities.NewsArticle.update(article.id, {
      likes: likeIds,
      like_names: likeNames,
      comments: commentsList
    });
  }
}

// Legacy function for backwards compatibility
export function getNewsContext(articles) {
  if (!articles || articles.length === 0) return '';
  const latest = articles[0];
  return `\n\n📰 AKTUELLE NACHRICHT: "${latest.headline}" - ${latest.content}. Du kannst das beiläufig erwähnen wenn es passt.`;
}