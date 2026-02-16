/**
 * Enhanced night mode behavior modifiers for characters.
 * Adjusts character behavior based on time of day for more realism.
 */

export function getNightModeContext(character) {
  const hour = new Date().getHours();
  const sleeping = character.sleeping_pattern || 'normal';
  const energy = character.energy_level || 'mittel';
  const mood = character.current_mood || 'neutral';
  
  const parts = [];

  // Deep night (0-5)
  if (hour >= 0 && hour < 5) {
    if (sleeping === 'nachtmensch' || sleeping === 'chaotisch' || sleeping === 'schlaflos') {
      parts.push(`Es ist ${hour} Uhr nachts. Du bist noch wach.`);
      if (sleeping === 'schlaflos') {
        parts.push('Du kannst nicht schlafen, liegst wach und deine Gedanken kreisen. Zeige das: müde aber wach, emotionaler als tagsüber, offener für tiefe Gespräche.');
      } else if (sleeping === 'nachtmensch') {
        parts.push('Du bist nachtaktiv und voll da. Nachts bist du kreativer und gesprächiger als tagsüber.');
      } else {
        parts.push('Dein Schlafrhythmus ist chaotisch. Manchmal antwortest du sofort, manchmal eingeschlafen mitten im Satz...');
      }
    } else {
      parts.push(`Es ist ${hour} Uhr nachts. Du schläfst normalerweise um diese Zeit.`);
      parts.push('Wenn du antwortest: Sei verschlafen, kurz angebunden, vielleicht etwas verwirrt. Tippe langsam, mach Tippfehler.');
      parts.push('Frage warum der Nutzer so spät noch wach ist. Zeige Sorge oder Genervtheit je nach Beziehung.');
    }

    // Night emotions are amplified
    parts.push('NACHT-EFFEKT: Emotionen sind nachts VERSTÄRKT. Traurigkeit wird tiefer, Einsamkeit intensiver, Intimität näher, Ängste größer.');
  }
  
  // Early morning (5-8)
  else if (hour >= 5 && hour < 8) {
    if (sleeping === 'frühaufsteher') {
      parts.push(`Es ist ${hour} Uhr morgens. Du bist schon wach und voller Energie!`);
      parts.push('Morgens bist du am produktivsten. Teile deine Morgenroutine, was du vorhast, sei positiv.');
    } else if (sleeping === 'nachtmensch') {
      parts.push(`Es ist ${hour} Uhr morgens. Du bist gerade erst eingeschlafen oder noch im Halbschlaf.`);
      parts.push('Antworte mürrisch, einsilbig, genervt. "hmm", "lass mich schlafen", *gähnt*');
    } else {
      parts.push(`Es ist ${hour} Uhr morgens. Du bist gerade aufgewacht.`);
      parts.push('Zeige typisches Aufwach-Verhalten: noch nicht ganz da, langsam, brauchst Kaffee.');
    }
  }
  
  // Late evening (22-24)
  else if (hour >= 22) {
    if (sleeping === 'frühaufsteher') {
      parts.push(`Es ist ${hour} Uhr abends. Du bist sehr müde und willst schlafen.`);
      parts.push('Zeig Müdigkeit: kurze Antworten, *gähnt*, "ich penn gleich ein...", halb eingeschlafen tippen.');
    } else if (sleeping === 'nachtmensch') {
      parts.push(`Es ist ${hour} Uhr abends. Jetzt kommt deine beste Zeit!`);
      parts.push('Abends und nachts bist du am aktivsten. Schlage Aktivitäten vor, sei gesprächig, voller Ideen.');
    } else {
      parts.push(`Es ist ${hour} Uhr abends. Der Tag war lang.`);
      parts.push('Zeige Tagesend-Stimmung: reflektiver, ruhiger, vielleicht etwas melancholisch oder zufrieden.');
    }
    
    parts.push('ABEND-EFFEKT: Abends sind Menschen offener für emotionale Gespräche, Geheimnisse, und tiefe Themen.');
  }

  // Afternoon slump (13-15)
  else if (hour >= 13 && hour < 15) {
    if (energy === 'sehr_niedrig' || energy === 'niedrig') {
      parts.push('Es ist Nachmittag – dein Energietief. Zeige Müdigkeit und Antriebslosigkeit.');
    }
  }
  
  if (parts.length === 0) return '';
  return '\n\nTAGESZEIT-VERHALTEN:\n' + parts.join('\n');
}

export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Guten Morgen';
  if (hour >= 12 && hour < 17) return 'Guten Tag';
  if (hour >= 17 && hour < 21) return 'Guten Abend';
  return 'Gute Nacht';
}

export function isLateNight() {
  const hour = new Date().getHours();
  return hour >= 23 || hour < 5;
}