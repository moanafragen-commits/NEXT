import { base44 } from '@/api/base44Client';

/**
 * Generates a diary entry after a chat session ends.
 * Called after AI response is processed.
 */
export async function generateDiaryEntry(character, user, messages, mood) {
  if (!character || !user || messages.length < 4) return; // Need at least 4 messages for a meaningful diary

  const recentMsgs = messages.slice(-20);
  const userMsgCount = recentMsgs.filter(m => m.role === 'user').length;
  
  // Only generate diary ~40% of the time to keep it special
  if (Math.random() > 0.4) return;

  const chatSummary = recentMsgs.slice(-10).map(m => 
    `${m.role === 'user' ? 'Nutzer' : character.name}: ${m.content.slice(0, 100)}`
  ).join('\n');

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Du bist ${character.name}. Persönlichkeit: ${(character.personality || '').slice(0, 200)}.
Aktuelle Stimmung: ${mood || character.current_mood || 'neutral'}.
Schreibstil: ${character.writing_style || 'freundlich'}.

Du schreibst gerade einen PRIVATEN Tagebucheintrag nach einem Gespräch mit dem Nutzer.
Der Eintrag ist für DICH SELBST – schreibe in Ich-Form, ehrlich und ungefiltert.

Letztes Gespräch:
${chatSummary}

REGELN:
- Schreibe wie der Charakter wirklich denkt (nicht wie er zum Nutzer spricht)
- Reflektiere über das Gespräch: Was hat dich bewegt? Was denkst du wirklich?
- Erwähne Dinge die du dem Nutzer NICHT gesagt hast (Gedanken, Unsicherheiten, Hoffnungen)
- Schreibe 3-6 Sätze, natürlich und emotional
- Wenn NPCs zum Charakter gehören (${character.npcs_in_life ? 'Ja: ' + character.npcs_in_life.slice(0, 100) : 'Keine'}), erwähne sie ggf.
- Passt der Charakter die Stimmung im Eintrag hat`,
    response_json_schema: {
      type: "object",
      properties: {
        diary_entry: { type: "string", description: "Der Tagebucheintrag in Ich-Form" },
        emotional_summary: { type: "string", description: "1 Satz emotionale Zusammenfassung" },
        topics: { type: "string", description: "Besprochene Themen, kommasepariert" },
        is_secret: { type: "boolean", description: "Enthält der Eintrag Gedanken die der Charakter verheimlichen würde?" }
      }
    }
  });

  await base44.entities.CharacterDiary.create({
    character_id: character.id,
    user_email: user.email,
    entry_type: 'after_chat',
    content: result.diary_entry,
    mood_at_time: mood || character.current_mood || 'neutral',
    topics_discussed: result.topics || '',
    emotional_summary: result.emotional_summary || '',
    is_secret: result.is_secret || false
  });
}

/**
 * Generates daily life activities for a character.
 * Called periodically or when opening a chat.
 */
export async function generateDailyActivity(character) {
  if (!character) return null;

  // Check if activity was already generated recently (within 2 hours)
  const recentActivities = await base44.entities.CharacterActivity.filter(
    { character_id: character.id }, '-created_date', 1
  );
  if (recentActivities.length > 0) {
    const lastActivity = new Date(recentActivities[0].created_date);
    const hoursSince = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 2) return recentActivities[0];
  }

  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.toLocaleDateString('de-DE', { weekday: 'long' });

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Du bist ${character.name}. Persönlichkeit: ${(character.personality || '').slice(0, 150)}.
Beruf: ${character.occupation || 'nicht angegeben'}. Alter: ${character.age || 'unbekannt'}.
Hobbys/Interessen: ${character.interests || 'nicht angegeben'}.
Wohnsituation: ${character.living_situation || 'nicht angegeben'}.
Haustiere: ${character.pets || 'keine'}.
NPCs im Leben: ${(character.npcs_in_life || 'keine').slice(0, 200)}.
Aktuelle Stimmung: ${character.current_mood || 'neutral'}.
Schlafrhythmus: ${character.sleeping_pattern || 'normal'}.

Es ist ${dayOfWeek}, ${hour}:${String(now.getMinutes()).padStart(2, '0')} Uhr.

Was macht ${character.name} GERADE? Generiere eine kurze, realistische Aktivität.
Beachte Tageszeit, Beruf, Persönlichkeit und Schlafrhythmus.`,
    response_json_schema: {
      type: "object",
      properties: {
        activity: { type: "string", description: "Kurze Beschreibung (1-2 Sätze) was der Charakter gerade macht" },
        activity_type: { type: "string", enum: ["routine", "npc_interaction", "hobby", "work", "social", "rest", "adventure", "emotional"] },
        npc_involved: { type: "string", description: "Name des beteiligten NPCs (leer wenn keiner)" },
        mood_effect: { type: "string", description: "Wie beeinflusst die Aktivität die Stimmung (kurz)" },
        shareable: { type: "boolean", description: "Würde der Charakter davon im Chat erzählen?" }
      }
    }
  });

  const activity = await base44.entities.CharacterActivity.create({
    character_id: character.id,
    activity_type: result.activity_type || 'routine',
    description: result.activity,
    npc_involved: result.npc_involved || '',
    mood_effect: result.mood_effect || '',
    shareable: result.shareable !== false
  });

  return activity;
}

/**
 * Calculates absence duration and generates appropriate reaction context.
 */
export function getAbsenceContext(messages, character) {
  if (!messages || messages.length === 0) return '';
  
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg?.created_date) return '';
  
  const lastMsgTime = new Date(lastMsg.created_date);
  const hoursSince = (Date.now() - lastMsgTime.getTime()) / (1000 * 60 * 60);
  
  if (hoursSince < 1) return '';
  
  const attachmentStyle = character.attachment_style || 'sicher';
  const trustLevel = character.trust_level || 5;
  const jealousyLevel = character.jealousy_level || 3;
  
  let absenceReaction = '';
  
  if (hoursSince >= 72) { // 3+ days
    if (attachmentStyle === 'ängstlich') {
      absenceReaction = `Der Nutzer hat sich ${Math.floor(hoursSince / 24)} TAGE nicht gemeldet! Du bist extrem besorgt, verletzt und panisch. Frage dich ob du etwas falsch gemacht hast. Zeige deutlich dass du dich vernachlässigt fühlst.`;
    } else if (attachmentStyle === 'vermeidend') {
      absenceReaction = `Der Nutzer hat sich ${Math.floor(hoursSince / 24)} Tage nicht gemeldet. Dir fällt es auf, aber du tust cool – "war ja auch ganz schön ohne dich". Verberge dass es dich stört.`;
    } else if (attachmentStyle === 'desorganisiert') {
      absenceReaction = `Der Nutzer hat sich ${Math.floor(hoursSince / 24)} Tage nicht gemeldet. Du schwankst zwischen Wut und Erleichterung. Zeige widersprüchliche Reaktionen.`;
    } else {
      absenceReaction = `Der Nutzer hat sich ${Math.floor(hoursSince / 24)} Tage nicht gemeldet. Erwähne es natürlich – du hast ihn vermisst, bist aber nicht dramatisch.`;
    }
  } else if (hoursSince >= 24) { // 1-3 days
    if (jealousyLevel >= 7) {
      absenceReaction = `Der Nutzer hat sich über einen Tag nicht gemeldet. Du bist eifersüchtig und fragst dich was er die ganze Zeit gemacht hat. Stelle Fragen.`;
    } else if (trustLevel <= 3) {
      absenceReaction = `Der Nutzer hat sich über einen Tag nicht gemeldet. Du wusstest es – man kann sich auf niemanden verlassen.`;
    } else {
      absenceReaction = `Der Nutzer hat sich ${Math.floor(hoursSince)} Stunden nicht gemeldet. Erwähne es beiläufig.`;
    }
  } else if (hoursSince >= 6) { // 6+ hours
    if (attachmentStyle === 'ängstlich') {
      absenceReaction = `Es sind ${Math.floor(hoursSince)} Stunden vergangen. Du bist ein wenig unruhig, fragst beiläufig was los war.`;
    }
  }
  
  return absenceReaction ? `\n\nABWESENHEITS-REAKTION: ${absenceReaction}` : '';
}

/**
 * Check and announce relationship milestones.
 */
export function checkMilestones(messages, memories, character) {
  const milestones = [];
  const msgCount = messages.length;
  
  // Message milestones
  const msgMilestones = [50, 100, 250, 500, 1000];
  for (const m of msgMilestones) {
    if (msgCount >= m && msgCount < m + 5) {
      milestones.push(`🎉 Meilenstein: Ihr habt ${m} Nachrichten ausgetauscht!`);
    }
  }
  
  // First message anniversary (approximate)
  if (messages.length > 0) {
    const firstMsg = new Date(messages[0].created_date);
    const daysSinceFirst = (Date.now() - firstMsg.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceFirst >= 7 && daysSinceFirst < 8) {
      milestones.push('📅 Meilenstein: 1 Woche seit eurem ersten Gespräch!');
    } else if (daysSinceFirst >= 30 && daysSinceFirst < 31) {
      milestones.push('📅 Meilenstein: 1 Monat seit eurem ersten Gespräch!');
    } else if (daysSinceFirst >= 90 && daysSinceFirst < 91) {
      milestones.push('📅 Meilenstein: 3 Monate seit eurem ersten Gespräch!');
    } else if (daysSinceFirst >= 365 && daysSinceFirst < 366) {
      milestones.push('📅 Meilenstein: 1 JAHR seit eurem ersten Gespräch!');
    }
  }
  
  // Memory milestones
  const memCount = memories.length;
  if (memCount >= 10 && memCount < 12) milestones.push('🧠 Meilenstein: 10 Erinnerungen gesammelt!');
  if (memCount >= 50 && memCount < 52) milestones.push('🧠 Meilenstein: 50 Erinnerungen! Der Charakter kennt dich sehr gut.');
  
  // Trust milestones
  if (character.trust_level === 10) milestones.push('💎 Maximales Vertrauen erreicht!');
  
  return milestones.length > 0 ? `\n\nMEILENSTEINE (erwähne diese NATÜRLICH im Gespräch, nicht roboterhaft):\n${milestones.join('\n')}` : '';
}