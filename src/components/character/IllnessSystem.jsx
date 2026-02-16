import { base44 } from '@/api/base44Client';

const ILLNESSES = [
  { name: 'Erkältung', severity: 'leicht', durationDays: [2, 5], symptoms: 'Schnupfen, leichter Husten, kratzig im Hals' },
  { name: 'Grippe', severity: 'mittel', durationDays: [4, 8], symptoms: 'Fieber, Gliederschmerzen, Schüttelfrost, Erschöpfung' },
  { name: 'Migräne', severity: 'mittel', durationDays: [0.5, 2], symptoms: 'starke Kopfschmerzen, Lichtempfindlichkeit, Übelkeit' },
  { name: 'Magen-Darm', severity: 'mittel', durationDays: [1, 3], symptoms: 'Übelkeit, Bauchschmerzen, kann kaum essen' },
  { name: 'Kopfschmerzen', severity: 'leicht', durationDays: [0.5, 1], symptoms: 'pochende Kopfschmerzen' },
  { name: 'Halsschmerzen', severity: 'leicht', durationDays: [2, 4], symptoms: 'Schluckbeschwerden, kratziger Hals' },
  { name: 'Fieber', severity: 'mittel', durationDays: [2, 5], symptoms: 'erhöhte Temperatur, Schwäche, Schwindel' },
  { name: 'Rückenschmerzen', severity: 'leicht', durationDays: [1, 4], symptoms: 'Verspannungen, eingeschränkte Bewegung' },
  { name: 'Lebensmittelvergiftung', severity: 'schwer', durationDays: [1, 3], symptoms: 'starke Übelkeit, Erbrechen, Durchfall, Schwäche' },
  { name: 'Mandelentzündung', severity: 'mittel', durationDays: [4, 7], symptoms: 'starke Halsschmerzen, Schluckbeschwerden, Fieber' },
  { name: 'Ohrenschmerzen', severity: 'leicht', durationDays: [2, 4], symptoms: 'stechende Schmerzen im Ohr, eingeschränktes Hören' },
  { name: 'Allergieschub', severity: 'leicht', durationDays: [1, 5], symptoms: 'Niesen, tränende Augen, verstopfte Nase' },
];

/**
 * Check if a character should randomly get sick.
 * Called when opening a chat. ~5% chance per chat open if healthy.
 * Auto-recovers after illness duration expires.
 */
export async function checkAndUpdateIllness(character) {
  if (!character) return character;

  // If currently sick, check if recovered
  if (character.illness && character.illness_started) {
    const startedAt = new Date(character.illness_started);
    const hoursSick = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60);
    const illness = ILLNESSES.find(i => i.name === character.illness);
    const maxHours = illness ? illness.durationDays[1] * 24 : 72;
    
    if (hoursSick > maxHours) {
      // Recovered!
      await base44.entities.Character.update(character.id, {
        illness: '',
        illness_severity: null,
        illness_started: null
      });
      return { ...character, illness: '', illness_severity: null, illness_started: null, just_recovered: true };
    }
    return character; // Still sick
  }

  // If healthy, small chance to get sick (~5%)
  if (Math.random() > 0.05) return character;

  // Get sick!
  const illness = ILLNESSES[Math.floor(Math.random() * ILLNESSES.length)];
  const now = new Date().toISOString();
  
  await base44.entities.Character.update(character.id, {
    illness: illness.name,
    illness_severity: illness.severity,
    illness_started: now
  });

  return { 
    ...character, 
    illness: illness.name, 
    illness_severity: illness.severity, 
    illness_started: now 
  };
}

/**
 * Build illness context for the AI prompt.
 */
export function buildIllnessContext(character) {
  if (!character.illness) {
    if (character.just_recovered) {
      return '\n\nGENESUNG: Du warst gerade krank, bist aber jetzt wieder gesund! Erwähne beiläufig dass es dir besser geht, du aber noch nicht ganz fit bist.';
    }
    return '';
  }

  const illness = ILLNESSES.find(i => i.name === character.illness) || {};
  const severity = character.illness_severity || 'leicht';
  const startedAt = character.illness_started ? new Date(character.illness_started) : new Date();
  const hoursSick = Math.round((Date.now() - startedAt.getTime()) / (1000 * 60 * 60));

  const severityEffects = {
    leicht: 'Du bist leicht angeschlagen. Erwähne es gelegentlich, aber es schränkt dich nicht stark ein. Vielleicht schnäuzt du dich zwischendurch oder seufzt kurz.',
    mittel: 'Du fühlst dich ziemlich schlecht. Du bist langsamer, müder, antwortest vielleicht kürzer. Erwähne deine Symptome natürlich im Gespräch. Du liegst wahrscheinlich im Bett oder auf der Couch.',
    schwer: 'Du bist richtig krank und es geht dir schlecht. Du antwortest deutlich kürzer und langsamer. Du brauchst Ruhe und Zuspruch. Du könntest gereizt oder weinerlich sein. Zeige klar dass du leidest.'
  };

  return `\n\nKRANKHEIT: Du bist seit ${hoursSick} Stunden krank mit "${character.illness}".
Symptome: ${illness.symptoms || character.illness}
Schweregrad: ${severity}
${severityEffects[severity]}
- Nutze *Aktionsbeschreibungen* wie *hustet*, *schnäuzt sich*, *reibt sich die Stirn*, *stöhnt leise*
- Wenn der Nutzer fragt wie es dir geht: Beschreibe deine Symptome authentisch
- Wenn der Nutzer Sorge zeigt: Reagiere je nach Persönlichkeit (dankbar, abwehrend, dramatisch, tapfer...)
- Deine Antworten können kürzer und müder sein als sonst
- Du darfst auch mal sagen "sorry, ich kann grad nicht so viel schreiben, mir gehts nicht gut"`;
}

/**
 * Get illness info for display.
 */
export function getIllnessDisplay(character) {
  if (!character.illness) return null;
  
  const severityEmoji = {
    leicht: '🤧',
    mittel: '🤒', 
    schwer: '🤕'
  };
  
  return {
    name: character.illness,
    severity: character.illness_severity || 'leicht',
    emoji: severityEmoji[character.illness_severity] || '🤧',
    label: `${character.illness} (${character.illness_severity || 'leicht'})`
  };
}