import { base44 } from '@/api/base44Client';

const CONFLICT_TRIGGERS = [
  { trigger: 'ignored_message', label: 'Ignorierte Nachricht', severity: 'leicht' },
  { trigger: 'broken_promise', label: 'Gebrochenes Versprechen', severity: 'mittel' },
  { trigger: 'jealousy', label: 'Eifersucht', severity: 'mittel' },
  { trigger: 'misunderstanding', label: 'Missverständnis', severity: 'leicht' },
  { trigger: 'betrayal', label: 'Verrat', severity: 'schwer' },
  { trigger: 'neglect', label: 'Vernachlässigung', severity: 'mittel' },
  { trigger: 'boundary_crossed', label: 'Grenze überschritten', severity: 'schwer' },
  { trigger: 'lying', label: 'Lüge aufgedeckt', severity: 'schwer' },
  { trigger: 'insensitivity', label: 'Unsensibilität', severity: 'leicht' },
  { trigger: 'different_values', label: 'Wertekollision', severity: 'mittel' },
];

export async function checkForConflict(character, messages, userEmail) {
  // Only trigger conflict with small chance
  if (Math.random() > 0.08) return null;
  
  // Don't create conflict if one is already active
  const existing = await base44.entities.ConflictEvent.filter({ 
    character_id: character.id, 
    user_email: userEmail, 
    status: 'active' 
  });
  if (existing.length > 0) return existing[0];

  const recentMsgs = messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Du bist ${character.name} (${character.personality}). 
Beziehung: ${character.initial_relationship || 'Freund'}, Vertrauen: ${character.trust_level || 5}/10, Eifersucht: ${character.jealousy_level || 3}/10.

Letzte Nachrichten:
${recentMsgs}

Entscheide ob es gerade einen Grund für einen Streit/Konflikt gibt. Wenn ja, generiere einen.
Beachte die Persönlichkeit und wie empfindlich der Charakter ist.`,
    response_json_schema: {
      type: "object",
      properties: {
        has_conflict: { type: "boolean" },
        trigger: { type: "string" },
        severity: { type: "string", enum: ["leicht", "mittel", "schwer", "kritisch"] },
        character_feeling: { type: "string" },
        resolution_hint: { type: "string" },
        emoji: { type: "string" }
      }
    }
  });

  if (!result.has_conflict) return null;

  const conflict = await base44.entities.ConflictEvent.create({
    character_id: character.id,
    user_email: userEmail,
    trigger: result.trigger,
    severity: result.severity || 'mittel',
    status: 'active',
    character_feeling: result.character_feeling,
    resolution_hint: result.resolution_hint,
    emoji: result.emoji || '💔',
    trust_impact: result.severity === 'schwer' ? -3 : result.severity === 'mittel' ? -2 : -1
  });

  return conflict;
}

export async function attemptResolution(conflict, character, userMessage) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `${character.name} ist wütend/verletzt wegen: "${conflict.trigger}"
Gefühl: ${conflict.character_feeling}
Schwere: ${conflict.severity}

Der User sagt: "${userMessage}"

Ist das eine aufrichtige Entschuldigung/Lösung? Bewertet auf einer Skala.`,
    response_json_schema: {
      type: "object",
      properties: {
        is_resolved: { type: "boolean" },
        resolution_quality: { type: "number" },
        character_response: { type: "string" },
        new_trust_change: { type: "number" },
        emoji: { type: "string" }
      }
    }
  });

  if (result.is_resolved) {
    await base44.entities.ConflictEvent.update(conflict.id, {
      status: 'resolved',
      resolution_text: result.character_response,
      trust_impact: result.new_trust_change || 1
    });
    // Boost trust after resolution
    if (result.new_trust_change > 0) {
      const newTrust = Math.min(10, (character.trust_level || 5) + result.new_trust_change);
      await base44.entities.Character.update(character.id, { trust_level: newTrust });
    }
  } else {
    await base44.entities.ConflictEvent.update(conflict.id, { status: 'escalated' });
  }

  return result;
}

export function getConflictContext(conflict) {
  if (!conflict || conflict.status !== 'active') return '';
  return `\n\n⚠️ AKTIVER KONFLIKT: Du bist verletzt/wütend wegen: "${conflict.trigger}". Du fühlst: ${conflict.character_feeling}. Zeige das in deinen Antworten. Sei distanziert, kurz angebunden oder emotional. Der Nutzer muss sich entschuldigen oder das Problem lösen. Schwere: ${conflict.severity}.`;
}

export const SEVERITY_CONFIG = {
  leicht: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Leichter Streit' },
  mittel: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Streit' },
  schwer: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Ernster Konflikt' },
  kritisch: { color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/30', label: 'Kritischer Konflikt' }
};