import { base44 } from '@/api/base44Client';

// ---- Trigger Templates by Category ----

const EVENT_TRIGGERS = {
  encounter: [
    { hint: 'Ein unerwarteter Besucher taucht auf', emoji: '🚪', urgency: 'mittel' },
    { hint: 'Du triffst jemanden Überraschendes in der Stadt', emoji: '👀', urgency: 'niedrig' },
    { hint: 'Ein Charakter bittet dich um einen unerwarteten Gefallen', emoji: '🤝', urgency: 'mittel' },
    { hint: 'Eine mysteriöse Nachricht erreicht dich', emoji: '✉️', urgency: 'hoch' },
  ],
  job_challenge: [
    { hint: 'Ein dringender Notfall im Job', emoji: '🚨', urgency: 'kritisch' },
    { hint: 'Ein wichtiger Kontakt will dich sprechen', emoji: '📞', urgency: 'hoch' },
    { hint: 'Eine unerwartete Chance in der Karriere', emoji: '🌟', urgency: 'mittel' },
    { hint: 'Budget-Krise oder logistisches Problem', emoji: '💸', urgency: 'hoch' },
    { hint: 'Teamkonflikt muss gelöst werden', emoji: '⚔️', urgency: 'mittel' },
  ],
  relationship: [
    { hint: 'Ein Charakter gesteht etwas Wichtiges', emoji: '💭', urgency: 'mittel' },
    { hint: 'Eifersucht oder Missverständnis', emoji: '😤', urgency: 'hoch' },
    { hint: 'Eine romantische Gelegenheit', emoji: '💕', urgency: 'niedrig' },
    { hint: 'Ein alter Freund meldet sich', emoji: '📱', urgency: 'niedrig' },
    { hint: 'Vertrauensbruch wurde entdeckt', emoji: '💔', urgency: 'kritisch' },
  ],
  opportunity: [
    { hint: 'Ein lukratives Angebot wartet', emoji: '💰', urgency: 'mittel' },
    { hint: 'Einladung zu einem besonderen Event', emoji: '🎫', urgency: 'niedrig' },
    { hint: 'Neue Fähigkeit kann erlernt werden', emoji: '📚', urgency: 'niedrig' },
    { hint: 'VIP-Zugang freigeschaltet', emoji: '🌟', urgency: 'mittel' },
  ],
  crisis: [
    { hint: 'Etwas geht dramatisch schief', emoji: '⚡', urgency: 'kritisch' },
    { hint: 'Ein Charakter ist in Gefahr', emoji: '🆘', urgency: 'kritisch' },
    { hint: 'Ein Skandal droht', emoji: '📰', urgency: 'hoch' },
  ],
  discovery: [
    { hint: 'Ein verborgenes Geheimnis kommt ans Licht', emoji: '🔍', urgency: 'mittel' },
    { hint: 'Etwas Überraschendes wurde gefunden', emoji: '🗝️', urgency: 'niedrig' },
    { hint: 'Ein versteckter Ort wurde entdeckt', emoji: '🗺️', urgency: 'niedrig' },
  ],
  social: [
    { hint: 'Gruppenaktivität wird vorgeschlagen', emoji: '👥', urgency: 'niedrig' },
    { hint: 'Jemand braucht moralische Unterstützung', emoji: '🫂', urgency: 'mittel' },
    { hint: 'Party oder Feier steht an', emoji: '🎉', urgency: 'niedrig' },
  ]
};

// ---- Context Analyzer ----

function analyzeContext({ characters, jobs, messages, userLevel }) {
  const context = { suggestedCategories: [], weightModifiers: {} };

  // Job-based triggers
  const activeJobs = jobs.filter(j => j.status === 'aktiv');
  if (activeJobs.length > 0) {
    context.suggestedCategories.push('job_challenge');
    context.weightModifiers.job_challenge = 2.0;
  }

  // Relationship-based triggers
  const highTrustChars = characters.filter(c => (c.trust_level || 5) >= 7);
  const jealousChars = characters.filter(c => (c.jealousy_level || 3) >= 6);
  if (highTrustChars.length > 0) {
    context.suggestedCategories.push('relationship');
    context.weightModifiers.relationship = 1.5;
  }
  if (jealousChars.length > 0) {
    context.weightModifiers.relationship = (context.weightModifiers.relationship || 1) + 0.5;
  }

  // Milestone-based
  const totalMessages = messages.length;
  if (totalMessages > 0 && totalMessages % 50 === 0) {
    context.suggestedCategories.push('opportunity');
    context.weightModifiers.opportunity = 2.0;
  }

  // Level-based
  if (userLevel?.level >= 5) {
    context.suggestedCategories.push('discovery');
  }

  // Always possible
  context.suggestedCategories.push('encounter', 'social', 'crisis', 'opportunity', 'discovery');

  return context;
}

// ---- Weighted Random Category ----

function pickCategory(context) {
  const allCats = [...new Set(context.suggestedCategories)];
  const weights = allCats.map(cat => context.weightModifiers[cat] || 1.0);
  const total = weights.reduce((s, w) => s + w, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < allCats.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return allCats[i];
  }
  return allCats[allCats.length - 1];
}

// ---- Main Generator ----

export async function checkAndGenerateDynamicEvent({ userEmail, characters, jobs, messages, userLevel }) {
  // Check for existing active events
  const existing = await base44.entities.DynamicEvent.filter({
    user_email: userEmail,
    status: 'active'
  }, '-created_date', 5);

  const now = new Date();

  // Expire old events
  for (const evt of existing) {
    if (evt.expires_at && new Date(evt.expires_at) < now) {
      await base44.entities.DynamicEvent.update(evt.id, { status: 'expired' });
    }
  }

  const activeEvents = existing.filter(e => !e.expires_at || new Date(e.expires_at) > now);
  
  // Max 2 active events at a time
  if (activeEvents.length >= 2) return activeEvents;

  // 12% chance per app open
  if (Math.random() > 0.12) return activeEvents;

  const context = analyzeContext({ characters, jobs, messages, userLevel });
  const category = pickCategory(context);
  const templates = EVENT_TRIGGERS[category] || EVENT_TRIGGERS.encounter;
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Pick a relevant character
  const nonArchived = characters.filter(c => !c.is_archived && !c.is_blocked);
  const relatedChar = nonArchived.length > 0
    ? nonArchived[Math.floor(Math.random() * nonArchived.length)]
    : null;

  // Pick a related job for job events
  const activeJobs = jobs.filter(j => j.status === 'aktiv');
  const relatedJob = category === 'job_challenge' && activeJobs.length > 0
    ? activeJobs[Math.floor(Math.random() * activeJobs.length)]
    : null;

  // Build rich prompt
  const charContext = relatedChar
    ? `Beteiligter Charakter: ${relatedChar.name} (${relatedChar.personality?.slice(0, 100)}). Beziehung: ${relatedChar.initial_relationship || 'Bekannte/r'}. Stimmung: ${relatedChar.current_mood || 'neutral'}.`
    : 'Kein bestimmter Charakter beteiligt.';

  const jobContext = relatedJob
    ? `Aktueller Job: ${relatedJob.job_title} bei ${relatedJob.employer}. Manager: ${relatedJob.manager_name}.`
    : '';

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Generiere ein dynamisches In-App-Event für ein Social-Charakter-Rollenspiel.

KATEGORIE: ${category}
HINWEIS: ${template.hint}
${charContext}
${jobContext}

REGELN:
- Das Event soll spannend, immersiv und zum Mitmachen einladen
- Erstelle GENAU 3 Auswahlmöglichkeiten mit unterschiedlichen Risiken und Belohnungen
- Jede Wahl hat ein klares Ergebnis (outcome_description: was passiert wenn man das wählt)
- Reward-Coins: 5-50, XP: 10-60 je nach Risiko
- Hohe Risiko-Optionen = höhere Belohnung aber mögliche negative Effekte
- Schreibe auf Deutsch, kurz und knackig
- mood_effect: eines von "positiv", "negativ", "gemischt", "neutral"
- risk_level: eines von "sicher", "mittel", "riskant"`,
    response_json_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Knackiger Titel (max 60 Zeichen)" },
        description: { type: "string", description: "Ereignisbeschreibung (2-3 Sätze)" },
        emoji: { type: "string" },
        impact: { type: "string", enum: ["positive", "negative", "neutral", "mixed"] },
        choices: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string", description: "Kurzer Aktionstext (max 30 Zeichen)" },
              emoji: { type: "string" },
              outcome_description: { type: "string", description: "Was passiert (1-2 Sätze)" },
              reward_coins: { type: "number" },
              reward_xp: { type: "number" },
              mood_effect: { type: "string" },
              risk_level: { type: "string" }
            }
          }
        }
      }
    }
  });

  const expiresAt = new Date(now.getTime() + (template.urgency === 'kritisch' ? 6 : template.urgency === 'hoch' ? 12 : 24) * 60 * 60 * 1000);

  const event = await base44.entities.DynamicEvent.create({
    user_email: userEmail,
    title: result.title,
    description: result.description,
    emoji: result.emoji || template.emoji,
    event_category: category,
    trigger_source: relatedJob ? 'job' : relatedChar ? 'relationship' : 'random',
    related_character_id: relatedChar?.id || null,
    related_job_id: relatedJob?.id || null,
    choices: result.choices || [],
    chosen_option: -1,
    status: 'active',
    impact: result.impact || 'neutral',
    urgency: template.urgency,
    expires_at: expiresAt.toISOString()
  });

  return [...activeEvents, event];
}

// ---- Resolve Event (player makes a choice) ----

export async function resolveEvent(eventId, choiceIndex, addXP) {
  const events = await base44.entities.DynamicEvent.filter({ id: eventId });
  const event = events[0];
  if (!event || event.status !== 'active') return null;

  const choice = event.choices?.[choiceIndex];
  if (!choice) return null;

  // Generate personalized outcome
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Der Spieler hat sich für "${choice.label}" entschieden.
Event: ${event.title} – ${event.description}
Gewählte Aktion: ${choice.emoji} ${choice.label}
Erwartetes Ergebnis: ${choice.outcome_description}
Risiko: ${choice.risk_level}

Schreibe ein kurzes, lebhaftes Ergebnis (2-3 Sätze) auf Deutsch. 
${choice.risk_level === 'riskant' ? 'Es besteht eine 40% Chance dass es schiefgeht.' : ''}
Entscheide ob es gut oder schlecht ausgeht basierend auf dem Risiko.`,
    response_json_schema: {
      type: "object",
      properties: {
        outcome_text: { type: "string" },
        success: { type: "boolean" },
        final_coins: { type: "number" },
        final_xp: { type: "number" }
      }
    }
  });

  const finalCoins = result.success ? (choice.reward_coins || 10) : Math.round((choice.reward_coins || 10) * 0.3);
  const finalXP = result.success ? (choice.reward_xp || 15) : Math.round((choice.reward_xp || 15) * 0.5);

  await base44.entities.DynamicEvent.update(eventId, {
    chosen_option: choiceIndex,
    outcome_text: result.outcome_text,
    status: 'resolved',
    reward_coins: finalCoins,
    reward_xp: finalXP
  });

  // Award XP + Coins
  if (addXP) {
    addXP({ xp: finalXP, coins: finalCoins });
  }

  return {
    outcome_text: result.outcome_text,
    success: result.success,
    coins: finalCoins,
    xp: finalXP
  };
}