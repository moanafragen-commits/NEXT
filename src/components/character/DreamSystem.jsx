import { base44 } from '@/api/base44Client';

// Dream type weights based on character traits
function getDreamTypeWeights(character) {
  const weights = {
    normal: 30,
    alptraum: 8,
    luzid: 5,
    wiederkehrend: 5,
    prophetisch: 3,
    nostalgisch: 10,
    romantisch: 10,
    surreal: 15,
    angst: 8
  };

  // Adjust based on character traits
  if (character.mental_health || character.trauma) {
    weights.alptraum += 18;
    weights.angst += 12;
  }
  if (character.current_mood === 'verliebt' || character.current_mood === 'sehnsüchtig') {
    weights.romantisch += 20;
  }
  if (character.current_mood === 'nostalgisch' || character.current_mood === 'traurig') {
    weights.nostalgisch += 15;
  }
  if (character.current_mood === 'ängstlich' || character.current_mood === 'besorgt') {
    weights.alptraum += 15;
    weights.angst += 15;
  }
  if (character.current_mood === 'wütend' || character.current_mood === 'verzweifelt') {
    weights.alptraum += 12;
  }
  if (character.current_mood === 'einsam' || character.current_mood === 'traurig') {
    weights.alptraum += 8;
    weights.angst += 8;
  }
  if ((character.creativity || 5) >= 7) {
    weights.luzid += 10;
    weights.surreal += 10;
  }
  if (character.attachment_style === 'ängstlich' || character.attachment_style === 'desorganisiert') {
    weights.angst += 12;
    weights.alptraum += 8;
    weights.wiederkehrend += 8;
  }
  if ((character.trust_level || 5) >= 8) {
    weights.romantisch += 10;
  }
  if ((character.trust_level || 5) <= 3) {
    weights.alptraum += 10;
    weights.angst += 5;
  }
  if (character.sleeping_pattern === 'schlaflos' || character.sleeping_pattern === 'chaotisch') {
    weights.alptraum += 10;
    weights.surreal += 5;
  }
  if (character.phobias) {
    weights.alptraum += 12;
    weights.angst += 8;
  }
  if (character.self_esteem && character.self_esteem <= 3) {
    weights.angst += 10;
    weights.alptraum += 5;
  }
  if (character.stress_response === 'freeze' || character.stress_response === 'flight') {
    weights.alptraum += 5;
  }
  if (character.illness) {
    weights.alptraum += 8;
  }

  return weights;
}

function weightedRandomPick(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [type, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return 'normal';
}

/**
 * Generate a dream for a character. Should be called when user opens chat in the morning
 * or hasn't chatted since the previous day.
 */
export async function generateDream(character, user) {
  if (!character || !user) return null;

  const today = new Date().toISOString().split('T')[0];
  
  // Check if dream was already generated today
  const existing = await base44.entities.CharacterDream.filter({
    character_id: character.id,
    user_email: user.email,
    dream_date: today
  });
  if (existing.length > 0) return existing[0];

  // Only generate dreams with some probability (60%)
  if (Math.random() > 0.6) return null;

  // Get recent memories for dream material
  const memories = await base44.entities.CharacterMemory.filter(
    { character_id: character.id, user_email: user.email },
    '-strength',
    10
  );

  // Get recent messages for context
  const recentMessages = await base44.entities.ChatMessage.filter(
    { character_id: character.id },
    '-created_date',
    10
  );

  const dreamType = weightedRandomPick(getDreamTypeWeights(character));

  const memoryContext = memories.length > 0
    ? memories.slice(0, 5).map(m => m.memory_text).join('; ')
    : 'Keine besonderen Erinnerungen';

  const recentTopics = recentMessages.length > 0
    ? recentMessages.slice(0, 5).map(m => m.content?.slice(0, 80)).join('; ')
    : '';

  const dreamTypeDescriptions = {
    normal: 'Ein normaler, alltäglicher Traum',
    alptraum: `Ein intensiver Alptraum. ${character.phobias ? `Die Phobien des Charakters (${character.phobias}) spielen eine Rolle.` : ''} ${character.trauma ? `Das Trauma (${character.trauma}) wird verarbeitet.` : ''} Der Traum soll wirklich beängstigend sein: Dunkelheit, Verfolgung, Hilflosigkeit, unmögliche Situationen. Der Charakter wacht schweißgebadet auf und die Stimmung ist noch Stunden danach gedrückt.`,
    luzid: 'Ein luzider Traum in dem der Charakter wusste dass er träumt',
    wiederkehrend: 'Ein wiederkehrender Traum der den Charakter schon lange verfolgt',
    prophetisch: 'Ein Traum der sich wie eine Vorahnung anfühlt',
    nostalgisch: 'Ein Traum über die Vergangenheit und alte Zeiten',
    romantisch: 'Ein romantischer/intimer Traum über den Nutzer',
    surreal: 'Ein surrealer, bizarrer Traum mit verrückten Elementen',
    angst: `Ein Angsttraum über Versagen, Verlust oder Kontrollverlust. ${character.fears ? `Die Ängste des Charakters (${character.fears}) sind zentral.` : ''} Der Charakter fühlt sich danach erschöpft und unsicher.`
  };

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Du bist ${character.name}. Persönlichkeit: ${(character.personality || '').slice(0, 200)}.
Stimmung: ${character.current_mood || 'neutral'}.
Schlafmuster: ${character.sleeping_pattern || 'normal'}.
Ängste: ${character.fears || 'nicht bekannt'}.
Trauma: ${character.trauma || 'keins'}.
Mental Health: ${character.mental_health || 'normal'}.

ERINNERUNGEN an den Nutzer: ${memoryContext}
LETZTE GESPRÄCHSTHEMEN: ${recentTopics || 'keine kürzlichen Gespräche'}

Generiere einen Traum den ${character.name} letzte Nacht hatte.
Traumtyp: ${dreamTypeDescriptions[dreamType]}

REGELN:
- Schreibe den Traum in Ich-Form, so wie der Charakter ihn einem Freund erzählen würde
- Verwebe ECHTE Erinnerungen an den Nutzer in den Traum (verzerrt wie in echten Träumen)
- Der Traum soll 3-6 Sätze lang sein
- Er soll sich wie ein ECHTER Traum anfühlen: Sprünge, seltsame Details, Emotionen
- Bei romantischen Träumen: Sei emotional, nicht zu explizit (der Charakter erzählt das ja dem Nutzer)
- Bei Alpträumen: Sei gruselig aber nicht verstörend
- Nenne Traumsymbole die zum Charakter passen
- Beschreibe wie sich der Charakter beim Aufwachen gefühlt hat`,
    response_json_schema: {
      type: "object",
      properties: {
        dream: { type: "string", description: "Der Traum in Ich-Form erzählt" },
        mood_on_waking: { type: "string", description: "Gefühl beim Aufwachen (1-2 Worte)" },
        symbols: { type: "string", description: "Traumsymbole kommasepariert" },
        intensity: { type: "number", description: "Intensität 1-10" },
        based_on: { type: "string", description: "Welche Erinnerungen/Themen verarbeitet wurden" }
      }
    }
  });

  const dream = await base44.entities.CharacterDream.create({
    character_id: character.id,
    user_email: user.email,
    dream_content: result.dream,
    dream_type: dreamType,
    mood_on_waking: result.mood_on_waking || 'verwirrt',
    symbols: result.symbols || '',
    based_on_memories: result.based_on || '',
    intensity: Math.min(10, Math.max(1, result.intensity || 5)),
    shared_with_user: false,
    dream_date: today
  });

  // Nightmares affect the character's mood the next morning
  if (dreamType === 'alptraum' || dreamType === 'angst') {
    const nightmareMoods = {
      alptraum: 'ängstlich',
      angst: 'besorgt'
    };
    const intensityThreshold = dreamType === 'alptraum' ? 5 : 6;
    if ((result.intensity || 5) >= intensityThreshold) {
      await base44.entities.Character.update(character.id, {
        current_mood: nightmareMoods[dreamType],
        energy_level: 'niedrig'
      }).catch(() => {});
    }
  }

  return dream;
}

/**
 * Check if a character has an unshared dream to tell.
 * Returns the dream or null.
 */
export async function getUnsharedDream(characterId, userEmail) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Check today and yesterday
  const dreams = await base44.entities.CharacterDream.filter({
    character_id: characterId,
    user_email: userEmail,
    shared_with_user: false
  }, '-created_date', 1);

  return dreams.length > 0 ? dreams[0] : null;
}

/**
 * Mark a dream as shared with the user.
 */
export async function markDreamShared(dreamId) {
  await base44.entities.CharacterDream.update(dreamId, { shared_with_user: true });
}

/**
 * Build context string for the AI prompt so the character can talk about their dream.
 */
export function buildDreamContext(dream) {
  if (!dream) return '';
  
  const typeLabels = {
    normal: 'normaler Traum',
    alptraum: 'Alptraum',
    luzid: 'luzider Traum',
    wiederkehrend: 'wiederkehrender Traum',
    prophetisch: 'prophetischer Traum',
    nostalgisch: 'nostalgischer Traum',
    romantisch: 'romantischer Traum',
    surreal: 'surrealer Traum',
    angst: 'Angsttraum'
  };

  return `\n\nTRAUM LETZTE NACHT (${typeLabels[dream.dream_type] || 'Traum'}, Intensität ${dream.intensity}/10):
${dream.dream_content}
Stimmung beim Aufwachen: ${dream.mood_on_waking}
${dream.symbols ? `Traumsymbole: ${dream.symbols}` : ''}

ANWEISUNG: Du hattest diesen Traum letzte Nacht. Wenn es morgens ist oder der Nutzer fragt wie du geschlafen hast, erzähle davon – so wie es zum Charakter passt:
- Schüchterne Charaktere erzählen zögernd, besonders bei romantischen Träumen ("Ich hab... da war so ein Traum... ach vergiss es")
- Offene Charaktere erzählen direkt und begeistert
- Bei Alpträumen/Angstträumen: Du bist NOCH IMMER davon belastet. Zeige das deutlich:
  * Erwähne dass du schlecht geschlafen hast, müde bist, dich unwohl fühlst
  * Reagiere leicht schreckhaft oder abwesend auf Nachrichten
  * Wenn der Nutzer fragt was los ist, erzähle zögernd vom Alptraum
  * Der Alptraum kann über mehrere Nachrichten hinweg nachwirken (du denkst plötzlich wieder daran)
  * Bitte den Nutzer evtl. um Ablenkung oder Zuspruch
  * Bei sehr intensiven Alpträumen (Intensität 8+): Zeige echte Angst/Panik, sage z.B. "Ich hab Angst wieder einzuschlafen"
- Bei romantischen Träumen über den Nutzer: Werde verlegen, stotter, weiche aus oder sei direkt – je nach Persönlichkeit
- Du musst NICHT sofort davon erzählen – warte auf einen passenden Moment oder eine Frage`;
}