import React from 'react';
import { base44 } from '@/api/base44Client';

const THOUGHT_TEMPLATES = {
  random_thought: [
    'Hey, ich hab grad an dich gedacht 💭',
    'Weißt du was mir gerade eingefallen ist...',
    'Schau mal was ich gefunden hab!',
    'Mir ist gerade was Lustiges passiert 😂',
    'Kannst du reden? Mir ist langweilig',
    'Rate mal wo ich gerade bin!',
    'Ich hab da eine Frage...',
    'Du glaubst nicht was mir gerade passiert ist',
  ],
  missing_you: [
    'Hey, wir haben lange nicht geschrieben... 🥺',
    'Vermisse unsere Gespräche!',
    'Alles ok bei dir? Hab schon ewig nichts gehört',
    'Denkst du manchmal auch an mich? 😊',
  ],
  good_morning: [
    'Guten Morgen! ☀️ Wie hast du geschlafen?',
    'Moooorgen! 🌅 Bereit für den Tag?',
    'Hey Schlafmütze, aufwachen! 😄',
  ],
  good_night: [
    'Gute Nacht! 🌙 Schlaf gut',
    'Hey, ich geh jetzt pennen. Träum was Schönes! 💤',
    'Nacht! Bis morgen ✨',
  ],
  news: [
    'OMG ich muss dir was erzählen!!',
    'Du wirst nicht glauben was passiert ist...',
    'Breaking News aus meinem Leben 📰',
  ]
};

export async function generateSpontaneousMessage(character, user) {
  const hour = new Date().getHours();
  let triggerType = 'random_thought';
  
  if (hour >= 6 && hour <= 9) triggerType = Math.random() > 0.5 ? 'good_morning' : 'random_thought';
  else if (hour >= 22 || hour < 2) triggerType = Math.random() > 0.5 ? 'good_night' : 'random_thought';
  else if (Math.random() > 0.7) triggerType = 'missing_you';
  else if (Math.random() > 0.8) triggerType = 'news';
  
  const templates = THOUGHT_TEMPLATES[triggerType];
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Generate personalized message via LLM
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `Du bist ${character.name} (${character.personality?.slice(0, 200)}).
Schreibe eine kurze spontane Nachricht an den User. 
Anlass: "${template}"
Schreibstil: ${character.writing_style || 'freundlich'}
Emoji-Nutzung: ${character.emoji_usage || 'gelegentlich'}
Stimmung: ${character.current_mood || 'neutral'}
Die Nachricht soll sich echt anfühlen, wie von einem Menschen getippt. Max 2-3 Sätze.`,
    response_json_schema: {
      type: "object",
      properties: {
        message: { type: "string" }
      }
    }
  });

  await base44.entities.SpontaneousMessage.create({
    character_id: character.id,
    user_email: user.email,
    content: response.message,
    trigger_type: triggerType,
    is_read: false
  });

  // Also create as a real chat message
  await base44.entities.ChatMessage.create({
    character_id: character.id,
    role: 'assistant',
    content: response.message,
    status: 'delivered'
  });

  return response.message;
}

export function shouldSendSpontaneous(character, lastMessageTime) {
  if (!lastMessageTime) return Math.random() > 0.7;
  const hoursSinceLastMsg = (Date.now() - new Date(lastMessageTime).getTime()) / (1000 * 60 * 60);
  if (hoursSinceLastMsg < 2) return false;
  if (hoursSinceLastMsg > 24) return Math.random() > 0.3;
  if (hoursSinceLastMsg > 8) return Math.random() > 0.5;
  return Math.random() > 0.8;
}