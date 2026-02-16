import { base44 } from '@/api/base44Client';

const EVENT_TEMPLATES = {
  birthday: { emoji: '🎂', titleFn: (c) => `${c.name} hat Geburtstag!`, impact: 'positive', durationHours: 24 },
  moved: { emoji: '🏠', titleFn: (c) => `${c.name} ist umgezogen`, impact: 'neutral', durationHours: 72 },
  new_job: { emoji: '💼', titleFn: (c) => `${c.name} hat einen neuen Job`, impact: 'positive', durationHours: 48 },
  new_friend: { emoji: '👋', titleFn: (c) => `${c.name} hat jemanden kennengelernt`, impact: 'neutral', durationHours: 24 },
  mood_swing: { emoji: '🎭', titleFn: (c) => `${c.name} hat einen emotionalen Tag`, impact: 'negative', durationHours: 12 },
  surprise: { emoji: '🎁', titleFn: (c) => `${c.name} hat eine Überraschung für dich`, impact: 'positive', durationHours: 24 },
  confession: { emoji: '💬', titleFn: (c) => `${c.name} möchte dir etwas sagen...`, impact: 'neutral', durationHours: 12 },
  travel: { emoji: '✈️', titleFn: (c) => `${c.name} ist verreist`, impact: 'positive', durationHours: 72 },
  crisis: { emoji: '⚡', titleFn: (c) => `${c.name} braucht dich gerade`, impact: 'negative', durationHours: 12 },
  celebration: { emoji: '🎉', titleFn: (c) => `${c.name} feiert!`, impact: 'positive', durationHours: 24 },
};

const RANDOM_EVENTS = ['new_friend', 'mood_swing', 'surprise', 'confession', 'travel', 'crisis', 'celebration'];

export async function checkAndGenerateEvent(character, userEmail) {
  // Check existing active events
  const existing = await base44.entities.CharacterEvent.filter({ 
    character_id: character.id, 
    user_email: userEmail, 
    is_active: true 
  });
  const now = new Date();
  
  // Expire old events
  for (const evt of existing) {
    if (evt.expires_at && new Date(evt.expires_at) < now) {
      await base44.entities.CharacterEvent.update(evt.id, { is_active: false });
    }
  }
  
  const activeEvents = existing.filter(e => !e.expires_at || new Date(e.expires_at) > now);
  if (activeEvents.length > 0) return activeEvents[0]; // Already has active event
  
  // Random chance to generate event (~5% per chat open)
  if (Math.random() > 0.05) return null;
  
  const eventType = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  const template = EVENT_TEMPLATES[eventType];
  
  // Generate personalized description
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `Du bist ${character.name} (${(character.personality || '').slice(0, 150)}).
Generiere eine KURZE Beschreibung (1-2 Sätze) für dieses Event: "${template.titleFn(character)}"
Typ: ${eventType}. Stimmung: ${character.current_mood || 'neutral'}. 
Die Beschreibung soll spannend klingen und den User motivieren zu chatten.`,
    response_json_schema: {
      type: "object",
      properties: { description: { type: "string" } }
    }
  });
  
  const expiresAt = new Date(now.getTime() + template.durationHours * 60 * 60 * 1000);
  
  const event = await base44.entities.CharacterEvent.create({
    character_id: character.id,
    user_email: userEmail,
    event_type: eventType,
    title: template.titleFn(character),
    description: response.description,
    emoji: template.emoji,
    impact: template.impact,
    is_active: true,
    expires_at: expiresAt.toISOString()
  });
  
  return event;
}

export function getEventContext(event) {
  if (!event) return '';
  return `\n\nAKTUELLES EVENT: ${event.emoji} ${event.title}
Beschreibung: ${event.description}
Stimmung: ${event.impact === 'positive' ? 'positiv' : event.impact === 'negative' ? 'negativ' : 'neutral'}
Reagiere in deinen Antworten NATÜRLICH auf dieses Event. Es beeinflusst dein Verhalten und deine Stimmung.`;
}

export { EVENT_TEMPLATES };