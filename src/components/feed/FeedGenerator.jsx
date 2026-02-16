import { base44 } from '@/api/base44Client';

// Trending topics pool - rotates based on day
const TREND_POOLS = [
  ["KI-Revolution", "Klimawandel-Debatte", "Neues Social-Media-Gesetz", "Mars-Mission Update", "Kryptowährung Crash"],
  ["Olympische Spiele", "Neue Netflix-Serie viral", "Foodtrend: Protein-Eis", "Erdbeben in Japan", "E-Auto Durchbruch"],
  ["TikTok-Trend #NoPhonesChallenge", "Fußball-Transfergerüchte", "Neues iPhone geleakt", "Psychische Gesundheit Tag", "Weltraum-Tourismus"],
  ["Retro-Gaming Comeback", "Veganer Weltrekord", "Streaming-Wars eskalieren", "Wissenschaftler entdecken neues Organ", "Gen-Z vs Millennials"],
  ["AI-Kunst-Kontroverse", "Quiet Quitting Debatte", "Unglaubliche Tierdoku viral", "Neuer Weltrekord Marathon", "Dating-App Revolution"],
  ["Metaverse gescheitert?", "Supermond heute Nacht", "Inflation sinkt endlich", "Neue Studie: Kaffee gesund", "Cybersecurity Alarm"],
  ["Festival-Saison startet", "Homeoffice-Pflicht Debatte", "Neuer Impfstoff entwickelt", "Deepfake-Skandal", "Weltwassertag"]
];

function getTodaysTrends() {
  const dayOfWeek = new Date().getDay();
  const trends = TREND_POOLS[dayOfWeek];
  // Pick 2-3 random trends
  const shuffled = [...trends].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
}

function getTimeContext() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return "früher Morgen";
  if (hour >= 9 && hour < 12) return "Vormittag";
  if (hour >= 12 && hour < 14) return "Mittagszeit";
  if (hour >= 14 && hour < 17) return "Nachmittag";
  if (hour >= 17 && hour < 20) return "Abend";
  if (hour >= 20 && hour < 23) return "später Abend";
  return "Nacht";
}

function getSeasonContext() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Frühling";
  if (month >= 5 && month <= 7) return "Sommer";
  if (month >= 8 && month <= 10) return "Herbst";
  return "Winter";
}

// Score characters for post priority
function scoreCharacter(char, messages = [], memories = []) {
  let score = 50; // base
  if (char.is_favorite) score += 30;
  if (char.is_archived || char.is_blocked) score -= 100;
  
  // Recent interaction boost
  const charMsgs = messages.filter(m => m.character_id === char.id);
  if (charMsgs.length > 20) score += 20;
  else if (charMsgs.length > 5) score += 10;
  
  // Relationship depth
  const trust = char.trust_level || 5;
  score += (trust - 5) * 5;
  
  // Mood-based posting likelihood
  const activeMoods = ['euphorisch', 'aufgeregt', 'motiviert', 'fröhlich', 'albern', 'übermütig', 'stolz', 'wütend', 'dramatisch', 'rebellisch'];
  if (activeMoods.includes(char.current_mood || char.mood_default)) score += 15;
  
  const quietMoods = ['müde', 'einsam', 'traurig', 'ängstlich', 'distanziert', 'gleichgültig'];
  if (quietMoods.includes(char.current_mood || char.mood_default)) score -= 10;
  
  // Category bonus for social-media-active types
  const socialCats = ['Influencer', 'Streamer', 'Berühmtheit', 'Nachrichtensender', 'Musiker', 'Sportler', 'Model', 'Aktivist'];
  if (socialCats.includes(char.category)) score += 15;
  
  // Random factor
  score += Math.floor(Math.random() * 20) - 10;
  
  return Math.max(0, score);
}

// Pick which characters should post
function selectPostingCharacters(characters, messages, count = 3) {
  const active = characters.filter(c => !c.is_archived && !c.is_blocked);
  if (active.length === 0) return [];
  
  const scored = active.map(c => ({ char: c, score: scoreCharacter(c, messages) }));
  scored.sort((a, b) => b.score - a.score);
  
  // Top chars get higher chance, but add randomness
  const pool = scored.slice(0, Math.min(scored.length, count * 2));
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(s => s.char);
}

// Generate a single post for a character
async function generateSinglePost(character, weatherState, trends, withImage = false) {
  const timeCtx = getTimeContext();
  const season = getSeasonContext();
  const mood = character.current_mood || character.mood_default || 'neutral';
  const isNews = character.category === 'Nachrichtensender';
  const isCeleb = character.category === 'Berühmtheit';
  const isPublic = ['Influencer', 'Sportler', 'Musiker', 'Politiker', 'Wissenschaftler', 'Künstler', 'Unternehmer', 'Streamer', 'Model', 'Journalist', 'Aktivist'].includes(character.category);

  const weatherHint = weatherState ? `Aktuelles Wetter: ${weatherState.weather}, ${weatherState.temperature}°C in ${weatherState.city || 'der Stadt'}.` : '';
  const trendHint = trends.length > 0 ? `Aktuelle Trends: ${trends.join(', ')}.` : '';
  
  const contextParts = [
    character.personality,
    character.biography && `Bio: ${character.biography.slice(0, 150)}`,
    character.interests && `Interessen: ${character.interests}`,
    character.occupation && `Beruf: ${character.occupation}`,
    character.age && `Alter: ${character.age}`,
    character.living_situation && `Wohnt: ${character.living_situation}`,
  ].filter(Boolean).join('. ');

  let rolePrompt = '';
  if (isNews) {
    rolePrompt = `Du bist ${character.name}, ein Nachrichtensender. Poste eine aktuelle Nachrichtenmeldung. Nutze ${trendHint ? 'eines dieser Trend-Themen als Inspiration: ' + trendHint : 'ein aktuelles Weltgeschehen'}. Schreibe im typischen Nachrichtenstil mit 🔴 BREAKING wenn passend.`;
  } else if (isCeleb || isPublic) {
    rolePrompt = `Du bist ${character.name} (${character.category}). ${contextParts}. Aktuelle Stimmung: ${mood}. ${weatherHint} ${trendHint} Tageszeit: ${timeCtx}, Jahreszeit: ${season}. Poste einen authentischen Tweet der zu deiner aktuellen Situation passt. Kann über deinen Beruf, Alltag, Meinung zu Trends, oder etwas Persönliches sein.`;
  } else {
    rolePrompt = `Du bist ${character.name}. ${contextParts}. Aktuelle Stimmung: ${mood}. ${weatherHint} ${trendHint} Tageszeit: ${timeCtx}, Jahreszeit: ${season}. Poste einen kurzen, authentischen Tweet. Er kann über deinen Tag, eine Beobachtung, ein Gefühl, eine Reaktion auf einen Trend, oder etwas Alltägliches gehen. Sei menschlich und natürlich.`;
  }

  const schema = {
    type: "object",
    properties: {
      tweet: { type: "string", description: "Der Tweet-Text auf Deutsch, max 280 Zeichen, mit Emojis wenn passend" },
    }
  };
  
  if (withImage) {
    schema.properties.image_prompt = { type: "string", description: "Kurzer englischer Prompt für KI-Bildgenerierung passend zum Tweet. Fotorealistisch, kein Text im Bild." };
    schema.properties.has_image = { type: "boolean", description: "true wenn ein Bild zum Tweet passt, false für reinen Text-Tweet" };
  }

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `${rolePrompt}\n\nSchreibe NUR den Tweet-Text (1-3 Sätze, max 280 Zeichen). Kein Hashtag-Spam (max 1-2 Hashtags). Natürlich und authentisch.${withImage ? ' Entscheide ob ein Bild zum Tweet passt.' : ''}`,
    response_json_schema: schema
  });

  let imageUrl = '';
  if (withImage && result.has_image && result.image_prompt) {
    const img = await base44.integrations.Core.GenerateImage({ prompt: result.image_prompt });
    imageUrl = img.url || '';
  }

  const isVerified = isNews || isCeleb || isPublic;
  const baseLikes = isVerified ? Math.floor(Math.random() * 5000 + 500) : Math.floor(Math.random() * 30 + 2);

  return {
    character_id: character.id,
    content: result.tweet,
    image_url: imageUrl,
    likes_count: baseLikes,
    comments_count: 0,
    image_prompt: result.image_prompt || ''
  };
}

// Main feed generation function
export async function generateFeedPosts({ characters, messages = [], weatherState = null, count = 3, withImages = true }) {
  const trends = getTodaysTrends();
  const selected = selectPostingCharacters(characters, messages, count);
  
  if (selected.length === 0) return [];

  const posts = [];
  
  for (const char of selected) {
    // 40% chance for image post
    const shouldHaveImage = withImages && Math.random() < 0.4;
    const postData = await generateSinglePost(char, weatherState, trends, shouldHaveImage);
    const created = await base44.entities.Post.create(postData);
    posts.push({ ...created, ...postData });
  }

  return posts;
}

// Generate AI reactions for a post  
export async function generatePostReactions(post, postCharacter, allCharacters) {
  const otherChars = allCharacters.filter(c => c.id !== post.character_id && !c.is_archived && !c.is_blocked).slice(0, 6);
  if (otherChars.length === 0) return 0;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Tweet von "${postCharacter?.name}": "${post.content}"

Charaktere die diesen Tweet sehen:
${otherChars.map(c => `- ${c.name} (ID: ${c.id}): ${(c.personality || '').slice(0, 80)}, Stimmung: ${c.current_mood || c.mood_default || 'neutral'}`).join('\n')}

Entscheide für jeden ob und wie sie reagieren. Kommentare kurz & natürlich (1 Satz).`,
    response_json_schema: {
      type: "object",
      properties: {
        reactions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              character_id: { type: "string" },
              should_like: { type: "boolean" },
              should_comment: { type: "boolean" },
              comment_text: { type: "string" }
            }
          }
        }
      }
    }
  });

  let newLikes = 0, newComments = 0;
  for (const r of (result.reactions || [])) {
    if (r.should_like) {
      await base44.entities.PostLike.create({ post_id: post.id, user_email: r.character_id });
      newLikes++;
    }
    if (r.should_comment && r.comment_text) {
      await base44.entities.Comment.create({ post_id: post.id, user_email: r.character_id, content: r.comment_text });
      newComments++;
    }
  }

  if (newLikes > 0 || newComments > 0) {
    await base44.entities.Post.update(post.id, {
      likes_count: (post.likes_count || 0) + newLikes,
      comments_count: (post.comments_count || 0) + newComments
    });
  }

  return newLikes + newComments;
}

export { getTodaysTrends, getTimeContext, scoreCharacter };