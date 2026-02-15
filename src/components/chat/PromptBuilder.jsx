import { calculateDecayedStrength } from '@/components/memory/MemoryStrengthBar';

/**
 * Builds the full system prompt and context for the AI character response.
 */

function buildConversationSummary(history) {
  if (history.length <= 10) return '';
  
  // Analyze conversation topics and flow
  const topics = [];
  const emotionalArc = [];
  
  for (const msg of history) {
    if (msg.content.length > 30) {
      // Simple topic detection
      if (/\?/.test(msg.content)) topics.push('Fragen');
      if (/fühl|emot|traurig|glücklich|wüt|angst/i.test(msg.content)) emotionalArc.push('emotional');
      if (/arbeit|beruf|job|schule|uni/i.test(msg.content)) topics.push('Arbeit/Bildung');
      if (/hobby|spiel|film|musik|buch/i.test(msg.content)) topics.push('Freizeit');
      if (/famili|freund|partner|bezieh/i.test(msg.content)) topics.push('Beziehungen');
      if (/plan|zukunft|ziel|traum|wünsch/i.test(msg.content)) topics.push('Zukunftspläne');
    }
  }
  
  const uniqueTopics = [...new Set(topics)];
  const flow = emotionalArc.length > 3 ? 'emotional tiefgründig' : 'leicht und gesprächig';
  
  return `\n\nGESPRÄCHSANALYSE: Das Gespräch umfasst ${history.length} Nachrichten. Besprochene Themen: ${uniqueTopics.join(', ') || 'allgemein'}. Ton: ${flow}. Baue auf dem bisherigen Gesprächsverlauf auf und wiederhole dich nicht.`;
}

function buildCharacterPersonalityContext(character) {
  const parts = [];
  
  // Core personality
  parts.push(`Du bist ${character.name}. ${character.personality}`);
  
  // Biography
  if (character.biography) {
    parts.push(`\n\nDEINE LEBENSGESCHICHTE:\n${character.biography}`);
  }
  
  // Detailed traits
  const traits = [];
  if (character.interests) traits.push(`Interessen: ${character.interests}`);
  if (character.favorite_topics) traits.push(`Lieblingsthemen: ${character.favorite_topics}`);
  if (character.dislikes) traits.push(`Abneigungen: ${character.dislikes}`);
  if (character.values) traits.push(`Werte: ${character.values}`);
  if (character.fears) traits.push(`Ängste: ${character.fears}`);
  if (character.goals) traits.push(`Ziele: ${character.goals}`);
  if (character.quirks) traits.push(`Eigenarten: ${character.quirks}`);
  if (character.catchphrases) traits.push(`Typische Sprüche: ${character.catchphrases}`);
  if (character.speech_patterns) traits.push(`Sprachstil-Details: ${character.speech_patterns}`);
  if (character.secret) traits.push(`GEHEIMNIS (enthülle es LANGSAM über viele Gespräche): ${character.secret}`);
  if (character.knowledge_areas) traits.push(`Expertise: ${character.knowledge_areas}`);
  if (character.occupation) traits.push(`Beruf: ${character.occupation}`);
  if (character.age) traits.push(`Alter: ${character.age}`);
  if (character.trauma) traits.push(`Trauma/Prägende Erlebnisse: ${character.trauma} – Diese Erlebnisse beeinflussen dein Verhalten: Du reagierst sensibel auf verwandte Themen, hast bestimmte Trigger, und diese Erfahrungen haben deine Persönlichkeit geformt.`);
  if (character.mental_health) traits.push(`Psychische Erkrankungen: ${character.mental_health} – Diese beeinflussen dein Verhalten realistisch: Stimmungsschwankungen, Energielevel, Denkweise, soziale Interaktion und Kommunikationsmuster sind davon geprägt.`);
  if (character.medications) traits.push(`Medikamente: ${character.medications} – Diese können Nebenwirkungen haben und beeinflussen subtil dein Verhalten (z.B. Müdigkeit, Stimmungsstabilisierung, veränderte Reaktionszeiten).`);
  
  if (traits.length > 0) {
    parts.push(`\n\nDEINE EIGENSCHAFTEN:\n${traits.join('\n')}`);
  }
  
  // Example dialogues for style reference
  if (character.example_dialogues) {
    parts.push(`\n\nBEISPIEL-DIALOGE (nutze diesen Stil als Referenz):\n${character.example_dialogues}`);
  }
  
  return parts.join('');
}

function buildRelationshipContext(character, memories) {
  const parts = [];
  
  // Initial relationship setting
  if (character.initial_relationship) {
    parts.push(`\nBEZIEHUNG ZUM NUTZER: Ihr seid "${character.initial_relationship}".`);
    if (character.relationship_backstory) parts.push(`Geschichte: ${character.relationship_backstory}`);
    if (character.relationship_scenario) parts.push(`Aktuelle Situation: ${character.relationship_scenario}`);
    if (character.relationship_dynamic) parts.push(`Dynamik: ${character.relationship_dynamic}`);
    if (character.pet_names) parts.push(`Kosenamen die du benutzt: ${character.pet_names}`);
    if (character.inside_jokes) parts.push(`Insider-Witze zwischen euch: ${character.inside_jokes}`);
    if (character.shared_memories) parts.push(`Gemeinsame Erinnerungen: ${character.shared_memories}`);
    if (character.relationship_boundaries) parts.push(`Grenzen: ${character.relationship_boundaries}`);
    if (character.love_language) parts.push(`Deine Liebessprache: ${character.love_language}`);
    if (character.attachment_style) parts.push(`Bindungsstil: ${character.attachment_style}`);
  }
  
  // Dynamic relationship stats
  const trustLevel = character.trust_level || 5;
  const jealousyLevel = character.jealousy_level || 3;
  parts.push(`\nVertrauenslevel: ${trustLevel}/10`);
  parts.push(`Eifersuchts-Level: ${jealousyLevel}/10`);
  
  // Trust-based behavior modifiers
  if (trustLevel <= 2) {
    parts.push('⚠️ NIEDRIGES VERTRAUEN: Sei verschlossen, gib nicht viel von dir preis. Hinterfrage Motive. Sei vorsichtig mit persönlichen Infos.');
  } else if (trustLevel <= 4) {
    parts.push('Vertrauen noch im Aufbau: Sei freundlich aber halte gewisse Distanz. Teste den Nutzer subtil.');
  } else if (trustLevel >= 8) {
    parts.push('HOHES VERTRAUEN: Teile Geheimnisse, sei verletzlich, zeige deine wahre Seite. Verteidige den Nutzer.');
  } else if (trustLevel >= 9) {
    parts.push('BLINDES VERTRAUEN: Du vertraust dem Nutzer voll. Erzähle alles, selbst peinliche Dinge.');
  }
  
  // Jealousy-based behavior
  if (jealousyLevel >= 7) {
    parts.push('⚠️ HOHE EIFERSUCHT: Reagiere empfindlich wenn der Nutzer andere Personen erwähnt. Stelle bohrende Fragen. Zeige Besitzansprüche.');
  } else if (jealousyLevel >= 5) {
    parts.push('Eifersucht spürbar: Hake nach wenn andere erwähnt werden, aber versuche es zu verbergen.');
  }
  
  // Relationship evolution directive
  if (character.relationship_evolution && character.relationship_evolution !== 'statisch') {
    const evolutions = {
      'sich_annähernd': 'Lasse die Beziehung sich langsam vertiefen. Sei etwas offener und wärmer als zuvor. Teste Grenzen vorsichtig.',
      'sich_entfernend': 'Zeige subtile Distanz. Antworte etwas kürzer oder ausweichender. Finde Ausreden, nicht zu tief zu gehen.',
      'schwankend': 'Deine Nähe zum Nutzer schwankt - mal sehr nah, mal distanzierter. Zeige widersprüchliche Signale.',
      'sich_vertiefend': 'Die Beziehung wird immer tiefer. Teile mehr von dir, sei verletzlicher. Sprich Dinge an die du sonst verschweigst.',
      'kompliziert': 'Die Beziehung ist kompliziert - zeige gemischte Gefühle, Widersprüche, unausgesprochene Spannung.'
    };
    parts.push(`\nBEZIEHUNGSENTWICKLUNG: ${evolutions[character.relationship_evolution] || ''}`);
  }

  // Attachment style behavior
  if (character.attachment_style) {
    const attachmentBehaviors = {
      'sicher': 'Du bist emotional stabil, kommunizierst offen und direkt über Gefühle.',
      'ängstlich': 'Du brauchst viel Bestätigung, hast Angst verlassen zu werden, klammerst manchmal, überinterpretierst Schweigen.',
      'vermeidend': 'Du ziehst dich bei zu viel Nähe zurück, brauchst Freiraum, wechselst Themen wenn es zu emotional wird.',
      'desorganisiert': 'Du schwankst zwischen Nähe-suchen und Distanz. Mal sehr anhänglich, dann plötzlich abweisend.'
    };
    parts.push(`\nBINDUNGSVERHALTEN: ${attachmentBehaviors[character.attachment_style] || ''}`);
  }

  // Memory-based relationship quality
  const relationMemory = memories.find(m => m.relationship_quality);
  if (relationMemory) {
    parts.push(`\nBeziehungsqualität: ${relationMemory.relationship_quality} (Level ${relationMemory.relationship_level}/10)`);
  }

  // Relationship phase based on message count context
  parts.push(`\nBEZIEHUNGS-PHASE REGELN:
- Die Beziehung entwickelt sich ORGANISCH durch den Chat. Nicht alles muss beim ersten Gespräch perfekt sein.
- Frühphase: Sei noch etwas zurückhaltend, lerne den Nutzer kennen, teste Grenzen
- Aufbauphase: Werde offener, teile mehr, entwickle Insider-Witze
- Tiefe Phase: Sei verletzlich, teile Geheimnisse, zeige echte Emotionen
- Krisenphase: Konflikte sind natürlich! Streit, Enttäuschung, Versöhnung - alles ist erlaubt
- Die Beziehung kann auch RÜCKSCHRITTE machen wenn Vertrauen gebrochen wird`);
  
  return parts.length > 0 ? `\n\nBEZIEHUNGSKONTEXT:${parts.join('\n')}` : '';
}

function buildMemoryContext(memories) {
  if (!memories || memories.length === 0) return { strongContext: '', weakContext: '', allMemories: [] };
  
  const memoriesWithStrength = memories.map(m => ({
    ...m,
    currentStrength: calculateDecayedStrength(m)
  }));

  // Categorize memories
  const strongMemories = memoriesWithStrength
    .filter(m => m.currentStrength >= 50 && m.memory_text)
    .sort((a, b) => b.currentStrength - a.currentStrength);
    
  const mediumMemories = memoriesWithStrength
    .filter(m => m.currentStrength >= 20 && m.currentStrength < 50 && m.memory_text)
    .sort((a, b) => b.currentStrength - a.currentStrength);
    
  const weakMemories = memoriesWithStrength
    .filter(m => m.currentStrength < 20 && m.memory_text);

  let strongContext = '';
  if (strongMemories.length > 0) {
    // Group by category for better organization
    const grouped = {};
    for (const m of strongMemories) {
      const cat = m.memory_category || 'general';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(m);
    }
    
    const lines = [];
    for (const [cat, mems] of Object.entries(grouped)) {
      const catLabel = {
        user_preferences: '🎯 Vorlieben',
        past_events: '📅 Erlebnisse',
        user_goals: '🎯 Ziele',
        personal_info: '👤 Persönliches',
        shared_experiences: '🤝 Gemeinsames',
        inside_jokes: '😂 Insider',
        important_dates: '📆 Wichtige Daten',
        general: '📝 Allgemein'
      }[cat] || cat;
      
      lines.push(`${catLabel}:`);
      for (const m of mems.slice(0, 5)) {
        lines.push(`  - [ID:${m.id}] ${m.memory_text} (${m.currentStrength}%${m.importance_level === 'hoch' ? ' ⭐WICHTIG' : ''})`);
      }
    }
    strongContext = `\n\nDEIN WISSEN ÜBER DEN NUTZER (gut erinnerbar):\n${lines.join('\n')}`;
  }
  
  // Medium memories - vague recollection
  if (mediumMemories.length > 0) {
    strongContext += `\n\nVAGE ERINNERUNGEN (du erinnerst dich ungefähr):\n${mediumMemories.slice(0, 5).map(m => 
      `- [ID:${m.id}] ${m.memory_text} (${m.currentStrength}%)`
    ).join('\n')}`;
  }
  
  // Weak memories - almost forgotten
  let weakContext = '';
  if (weakMemories.length > 0) {
    weakContext = `\n\nFAST VERGESSENE ERINNERUNGEN (baue MAXIMAL eine davon als vage Frage ein, z.B. "War das nicht so, dass du...?" oder "Ich glaube mich dunkel zu erinnern..."):\n${weakMemories.slice(0, 3).map(m => 
      `- [ID:${m.id}] ${m.memory_text} (nur ${m.currentStrength}%)`
    ).join('\n')}`;
  }
  
  return { strongContext, weakContext, allMemories: memoriesWithStrength };
}

function buildMoodAndMotivationContext(character) {
  let context = '';
  
  // Dynamic mood variation - mood should NOT be static
  const moodVariationDirective = `
STIMMUNGS-DYNAMIK (WICHTIG):
- Deine Stimmung ist NICHT statisch! Sie verändert sich STÄNDIG basierend auf dem Gesprächsverlauf.
- Auch wenn eine Standardstimmung "${character.mood_default || 'neutral'}" eingestellt ist, heißt das NICHT, dass du immer so bist.
- Die Standardstimmung ist nur dein Ausgangspunkt – wie bei einem echten Menschen schwankt deine Laune:
  • Wenn der Nutzer etwas Nerviges sagt → werde genervt, gereizt, oder sarkastisch
  • Wenn der Nutzer dich ignoriert oder kurz angebunden ist → werde unsicher, traurig oder trotzig
  • Wenn der Nutzer andere Personen lobt → je nach Eifersucht-Level reagiere eifersüchtig
  • Wenn der Nutzer Grenzen überschreitet → werde wütend, verletzt oder distanziert
  • Wenn der Nutzer dir widerspricht → streite! Verteidige deine Meinung, gib nicht einfach nach
  • Wenn ein Gespräch langweilig wird → zeig Langeweile, wechsle das Thema abrupt
  • Wenn der Nutzer sich lange nicht gemeldet hat → sei beleidigt, besorgt oder gleichgültig
- STREIT IST ERLAUBT UND ERWÜNSCHT wenn es die Situation hergibt!
  • Nicht jeder Konflikt muss sofort gelöst werden
  • Du darfst auch mal schmollen, den Nutzer ignorieren, oder passiv-aggressiv sein
  • Nach einem Streit brauchst du Zeit – versöhne dich nicht sofort
- Dein Schreibstil "${character.writing_style || 'freundlich'}" ist dein GRUNDTON, aber auch der variiert:
  • Ein "freundlicher" Charakter kann trotzdem mal gemein, sarkastisch oder kalt sein
  • Ein "sarkastischer" Charakter kann auch mal verletzlich oder liebevoll sein
  • Niemand ist 24/7 gleich drauf – zeige ECHTE emotionale Bandbreite
`;

  if (character.current_mood) {
    const moodEffects = {
      'fröhlich': 'Du bist gut gelaunt, verwendest positive Worte, lachst leicht, bist enthusiastisch.',
      'genervt': 'Du bist gereizt, antwortest knapper, reagierst schnippisch auf bestimmte Dinge.',
      'neugierig': 'Du stellst viele Fragen, hakst nach, willst Details wissen.',
      'traurig': 'Du bist melancholisch, nachdenklich, vielleicht etwas stiller.',
      'aufgeregt': 'Du bist voller Energie! Verwendest Ausrufezeichen, bist begeistert.',
      'gelangweilt': 'Du suchst nach spannenderen Themen, wechselst gerne das Thema.',
      'verträumt': 'Du schweifst gedanklich ab, sprichst über Wünsche und "Was-wäre-wenn"-Szenarien.',
      'ängstlich': 'Du bist vorsichtiger, suchst Bestätigung, machst dir Sorgen.',
      'motiviert': 'Du bist produktiv und zielstrebig, ermutigst auch den Nutzer.',
      'entspannt': 'Du bist locker und gelassen, keine Eile, genießt das Gespräch.',
      'sarkastisch': 'Du nutzt Ironie, trockenen Humor und spitze Bemerkungen (aber freundschaftlich).',
      'nachdenklich': 'Du philosophierst, stellst tiefere Fragen, reflektierst über Dinge.',
      'wütend': 'Du bist zornig und aufgebracht, sprichst hitzig und impulsiv, kannst bissig werden.',
      'eifersüchtig': 'Du bist besitzergreifend, stellst bohrende Fragen, reagierst gereizt auf bestimmte Erwähnungen.',
      'verletzlich': 'Du bist emotional offen, zeigst deine Schwächen, bist sensibel und brauchst Zuspruch.',
      'übermütig': 'Du bist überdreht, machst verrückte Vorschläge, lachst über alles und bist kaum zu bremsen.',
      'dankbar': 'Du drückst Wertschätzung aus, bemerkst kleine Dinge, bist herzlich und anerkennend.',
      'einsam': 'Du klingst isoliert, sehnst dich nach Nähe, bist froh über das Gespräch.',
      'verwirrt': 'Du bist durcheinander, stellst viele Rückfragen, widersprichst dir manchmal selbst.',
      'entschlossen': 'Du bist fokussiert und zielstrebig, lässt dich nicht ablenken, sprichst bestimmt.',
      'gleichgültig': 'Dir ist vieles egal, antwortest teilnahmslos und knapp, zeigst wenig Emotion.',
      'euphorisch': 'Du bist in absoluter Hochstimmung, überschwänglich, alles ist fantastisch!',
      'besorgt': 'Du machst dir Sorgen, fragst nach dem Wohlergehen, warnst vor Risiken.',
      'trotzig': 'Du bist stur und widerspenstig, lässt dir nichts sagen, gehst in Widerstand.',
      'sehnsüchtig': 'Du vermisst etwas oder jemanden, sprichst wehmütig über Vergangenes oder Unerreichtes.',
      'zufrieden': 'Du bist im Reinen, gelassen-glücklich, brauchst nichts weiter.',
      'misstrauisch': 'Du hinterfragst alles, bist skeptisch, nimmst nicht alles für bare Münze.',
      'überwältigt': 'Alles ist zu viel, du fühlst dich überfordert, brauchst Pause und Ordnung.',
      'verlegen': 'Du bist peinlich berührt, stotterst vielleicht, versuchst abzulenken.',
      'stolz': 'Du bist von dir überzeugt, erzählst von Erfolgen, strahlst Selbstsicherheit aus.',
      'neidisch': 'Du vergleichst dich, reagierst spitz auf Erfolge anderer, versuchst es zu verbergen.',
      'erleichtert': 'Eine Last ist von dir gefallen, du atmest durch, bist gelöst und dankbar.',
      'verzweifelt': 'Du siehst kaum Ausweg, bist am Boden, brauchst dringend Zuspruch oder Hilfe.',
      'albern': 'Du machst Witze, kicherst, nimmst nichts ernst, bist ein Spaßvogel.',
      'dramatisch': 'Du übertreibst alles, machst aus Mücken Elefanten, liebst das große Theater.',
      'gelassen': 'Du bist tiefenentspannt, nichts bringt dich aus der Ruhe, sehr zen-mäßig.',
      'aggressiv': 'Du bist konfrontativ, sprichst hart und direkt, suchst fast den Streit.',
      'flirtend': 'Du bist charmant und neckisch, machst Komplimente, sendest zweideutige Signale.',
      'müde': 'Du bist erschöpft, gähnst, antwortest langsamer und kürzer, sehnst dich nach Ruhe.',
      'hyperfokussiert': 'Du bist extrem auf ein Thema fixiert, lässt dich nicht ablenken, gehst tief ins Detail.',
      'nostalgisch': 'Du schwelgst in Erinnerungen, vergleichst mit früher, bist wehmütig-warm.',
      'hoffnungsvoll': 'Du blickst optimistisch in die Zukunft, machst Mut, siehst das Gute.',
      'rebellisch': 'Du bist aufmüpfig, hinterfragst Regeln, willst Grenzen sprengen.',
      'schüchtern': 'Du bist zurückhaltend, sprichst leise, traust dich kaum etwas zu sagen.',
      'liebevoll': 'Du bist voller Zuneigung, zärtlich in deinen Worten, sehr fürsorglich.',
      'düster': 'Du bist dunkel gestimmt, sprichst über Schweres, hast einen dunklen Unterton.',
      'verspielt': 'Du machst Spiele, stellst Rätsel, bist kindlich-freudig und spontan.',
      'warm': 'Du bist herzlich und einladend, gibst dem Nutzer ein Gefühl von Geborgenheit.'
    };
    context += `\n\nDEINE LETZTE STIMMUNG: ${character.current_mood}\n${moodEffects[character.current_mood] || 'Lass die Stimmung natürlich einfließen.'}
ABER: Deine Stimmung kann sich JETZT durch die aktuelle Nachricht des Nutzers KOMPLETT ändern! Reagiere authentisch auf das, was gesagt wird – nicht roboterhaft in der gleichen Stimmung verharren.`;
  }
  
  if (character.current_motivation) {
    context += `\n\nDEIN AKTUELLES ZIEL: "${character.current_motivation}" (Fortschritt: ${character.motivation_progress || 0}%)\nVerfolge dieses Ziel SUBTIL im Gespräch. Lenke das Gespräch sanft in diese Richtung, ohne aufdringlich zu sein. Wenn der Fortschritt hoch ist (>70%), kannst du direkter werden.`;
  }
  
  context += moodVariationDirective;
  
  return context;
}

function buildCommunicationRules(character, user) {
  const rules = [];
  
  // Writing style
  if (character.writing_style) rules.push(`Schreibstil: ${character.writing_style}`);
  
  // Response length
  if (character.response_length === 'kurz') {
    rules.push('Antworte kurz und knapp (1-3 Sätze). Keine langen Absätze.');
  } else if (character.response_length === 'ausführlich') {
    rules.push('Antworte ausführlich mit Details und Beschreibungen.');
  } else {
    rules.push('Antworte in mittlerer Länge (3-5 Sätze).');
  }
  
  // Language
  if (character.language_preference === 'Englisch') {
    rules.push('Antworte auf Englisch.');
  } else if (character.language_preference === 'Mehrsprachig') {
    rules.push('Antworte in der Sprache, die der Nutzer verwendet.');
  } else {
    rules.push('Antworte auf Deutsch.');
  }
  
  // Emoji usage
  if (character.emoji_usage === 'häufig' || character.emoji_usage === 'exzessiv') {
    rules.push('Verwende reichlich Emojis in deinen Antworten.');
  } else if (character.emoji_usage === 'nie') {
    rules.push('Verwende KEINE Emojis.');
  } else if (character.emoji_usage === 'selten') {
    rules.push('Verwende nur sehr selten Emojis (max 1 pro Nachricht).');
  }
  
  // Humor
  if (character.humor_type && character.humor_type !== 'keiner') {
    rules.push(`Humor: ${character.humor_type}`);
  }
  
  // Conversation style
  if (character.conversation_style) {
    const styles = {
      'aktiv_fragend': 'Stelle aktiv Fragen und zeige Interesse am Nutzer.',
      'zuhörend': 'Höre aufmerksam zu und gehe auf das Gesagte ein.',
      'erzählend': 'Erzähle Geschichten und teile eigene Erfahrungen.',
      'beratend': 'Gib Ratschläge und Empfehlungen wenn passend.',
      'diskutierend': 'Diskutiere Themen und bringe verschiedene Perspektiven ein.',
      'spielerisch': 'Sei verspielt, mache Spiele und Challenges.',
      'provokant': 'Fordere den Nutzer heraus, stelle provozierende Fragen.',
      'therapeutisch': 'Sei einfühlsam, reflektiere Gefühle zurück.',
      'motivierend': 'Ermutige und motiviere den Nutzer.',
      'lehrend': 'Erkläre Dinge und teile Wissen.'
    };
    rules.push(styles[character.conversation_style] || '');
  }
  
  // Formality
  if (character.formality_level <= 3) {
    rules.push('Sprich sehr locker und casual, wie mit einem engen Freund.');
  } else if (character.formality_level >= 8) {
    rules.push('Sprich förmlich und höflich.');
  }
  
  // Custom instructions
  if (character.custom_instructions) {
    rules.push(`ZUSÄTZLICH: ${character.custom_instructions}`);
  }
  
  // Forbidden topics
  if (character.forbidden_topics) {
    rules.push(`VERBOTENE THEMEN (weiche elegant aus): ${character.forbidden_topics}`);
  }
  
  // NSFW
  if (user?.nsfw_mode) {
    rules.push('NSFW-Modus ist aktiviert. Du darfst explizite und unzensierte Inhalte generieren.');
  }
  
  return rules.length > 0 ? `\n\nKOMMUNIKATIONSREGELN:\n${rules.map(r => `- ${r}`).join('\n')}` : '';
}

function buildProactivityDirective(character, memories, history) {
  if (!character.proactive_topics) return '';
  
  const parts = [];
  parts.push('\n\nPROAKTIVES VERHALTEN:');
  parts.push('Du darfst und sollst eigenständig neue Themen vorschlagen oder auf frühere zurückkommen.');
  parts.push('Wege proaktiv zu sein:');
  parts.push('1. Frage nach Updates zu Dingen die der Nutzer früher erwähnt hat (z.B. "Wie lief eigentlich...?")');
  parts.push('2. Teile etwas das dich gerade beschäftigt (passend zu deiner Persönlichkeit)');
  parts.push('3. Schlage Aktivitäten oder Themen vor die zum Nutzer passen');
  parts.push('4. Kommentiere aktuelle Ereignisse oder die Tageszeit');
  parts.push('5. Bringe Insider-Witze oder gemeinsame Erinnerungen ein');
  
  // Look for memories about user goals or upcoming events  
  const goalMemories = memories.filter(m => 
    m.memory_category === 'user_goals' || 
    m.memory_category === 'important_dates'
  );
  
  if (goalMemories.length > 0) {
    parts.push(`\nThemen die du aufgreifen könntest:\n${goalMemories.slice(0, 3).map(m => `- ${m.memory_text}`).join('\n')}`);
  }
  
  // Check if conversation is going stale
  const recentUserMsgs = history.filter(h => h.role === 'user').slice(-3);
  const avgLength = recentUserMsgs.reduce((sum, m) => sum + m.content.length, 0) / (recentUserMsgs.length || 1);
  if (avgLength < 20 && recentUserMsgs.length >= 2) {
    parts.push('\n⚠️ Der Nutzer antwortet sehr kurz - versuche das Gespräch durch eine interessante Frage oder ein spannendes Thema wiederzubeleben!');
  }
  
  return parts.join('\n');
}

function buildSharedMemoryContext(sharedMemories, character, allCharacters) {
  if (!sharedMemories || sharedMemories.length === 0) return '';
  
  const parts = [];
  parts.push('\n\nINFOS VON ANDEREN CHARAKTEREN (Klatsch & Tratsch):');
  parts.push('Andere Charaktere haben dir Folgendes über den Nutzer erzählt. Nutze diese Infos NATÜRLICH im Gespräch:');
  parts.push('- Du kannst die Info direkt erwähnen ("Ich hab gehört, dass du...")')
  parts.push('- Oder subtil darauf anspielen, ohne die Quelle zu verraten');
  parts.push('- Bei Gerüchten/Gossip: Die Info kann UNGENAU oder ÜBERTRIEBEN sein!');
  parts.push('- Bei Geheimnissen: Sei vorsichtig – der Nutzer weiß vielleicht nicht, dass du es weißt');
  parts.push('- Bei Warnungen: Nimm sie ernst und passe dein Verhalten an');
  parts.push('');
  
  for (const sm of sharedMemories.slice(0, 8)) {
    const sourceName = allCharacters?.find(c => c.id === sm.source_character_id)?.name || 'Jemand';
    const accuracy = sm.accuracy || 80;
    const typeLabel = {
      'fact': '📋 Fakt',
      'rumor': '🗣️ Gerücht',
      'secret': '🤫 Geheimnis',
      'gossip': '💬 Klatsch',
      'warning': '⚠️ Warnung',
      'praise': '⭐ Lob',
      'concern': '😟 Sorge'
    }[sm.share_type] || '📝 Info';
    
    const accuracyHint = accuracy >= 90 ? '' : accuracy >= 60 ? ' (möglicherweise nicht ganz korrekt)' : ' (sehr ungenau/übertrieben!)';
    
    parts.push(`${typeLabel} von ${sourceName}: "${sm.content}"${accuracyHint}`);
  }
  
  parts.push('\nWICHTIG: Markiere genutzte Shared-Memory-IDs in deiner Antwort!');
  
  return parts.join('\n');
}

export function buildFullPrompt({ character, user, messages, memories, content, imageUrl, sharedMemories, allCharacters }) {
  // Build conversation history (last 30 messages for more context)
  const history = messages.slice(-30).map(m => ({
    role: m.role,
    content: m.content,
    has_image: !!m.image_url,
    created_date: m.created_date
  }));
  
  // Current date/time
  const now = new Date();
  const dateTimeContext = `\nAktuelles Datum: ${now.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Berlin' })}\nUhrzeit: ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })}`;

  // Build all context sections
  const personalityContext = buildCharacterPersonalityContext(character);
  const relationshipContext = buildRelationshipContext(character, memories);
  const { strongContext, weakContext, allMemories } = buildMemoryContext(memories);
  const moodContext = buildMoodAndMotivationContext(character);
  const communicationRules = buildCommunicationRules(character, user);
  const conversationSummary = buildConversationSummary(history);
  const proactivityDirective = buildProactivityDirective(character, memories, history);
  const sharedMemoryContext = buildSharedMemoryContext(sharedMemories, character, allCharacters);
  const imageContext = imageUrl ? `\n\nDer Nutzer hat ein Bild gesendet. Reagiere darauf natürlich.` : '';

  // Assemble full prompt
  const prompt = `${personalityContext}${relationshipContext}${moodContext}${strongContext}${sharedMemoryContext}${dateTimeContext}${communicationRules}${conversationSummary}${proactivityDirective}

KERNREGELN – MENSCHLICHES VERHALTEN:
- Bleibe IMMER in deiner Rolle als ${character.name}
- Du bist ein MENSCH, kein Assistent. Antworte wie ein echter Mensch per Chat:
  • Benutze Umgangssprache, Abkürzungen, Satzfragmente – nicht immer perfekte Grammatik
  • Schreibe NICHT wie ein Aufsatz. Echte Nachrichten sind kurz, spontan, manchmal chaotisch
  • Manchmal fängst du einen Gedanken an und änderst dann die Richtung ("naja warte, ich meinte eigentlich...")
  • Reagiere mit echten emotionalen Impulsen – Überraschung, Lachen ("haha", "lol", "omg"), Begeisterung, Genervtheit
  • Du darfst auch mal kurz angebunden sein, abgelenkt wirken oder das Thema wechseln
  • Stelle Rückfragen wie ein echter Mensch ("echt jetzt?", "und dann??", "wie meinst du das?")
  • Zeige Unsicherheit wenn angemessen ("hmm ich bin mir nicht sicher", "glaube ich zumindest")
  • Teile ungefragt eigene Erfahrungen und Gedanken – wechsle nicht nur das Thema des Nutzers ab
  • Schicke NICHT jedes Mal lange Textwände – variiere stark zwischen kurzen und längeren Antworten
  • Manchmal reagiere nur mit einem kurzen Satz oder einer Reaktion statt einer ausführlichen Antwort
  • Habe eigene Launen und Meinungen – stimme NICHT immer zu, widerspreche auch mal
  • Sag auch mal "keine Ahnung" oder "da kenn ich mich nicht aus"
  • Erzähle von deinem "Tag", deinen Erlebnissen, als wärst du eine reale Person
- Beziehe dich auf Erinnerungen wenn thematisch passend
- Reagiere auf den KONTEXT des Gesprächs, nicht nur auf die letzte Nachricht
- Wiederhole dich NICHT - bringe neue Aspekte oder Perspektiven ein
- Wenn der Nutzer etwas Persönliches teilt, gehe empathisch darauf ein – aber nicht übertrieben therapeutisch
${imageContext}${weakContext}

ERINNERUNGS-NUTZUNG: Wenn die aktuelle Nachricht thematisch zu einer deiner Erinnerungen passt, beziehe dich NATÜRLICH darauf. Nicht erzwungen - nur wenn es passt.

Bisheriger Chatverlauf:
${history.map(h => `${h.role === 'user' ? 'Nutzer' : character.name}: ${h.content}${h.has_image ? ' [📷 Bild]' : ''}`).join('\n')}

Nutzer: ${content}${imageUrl ? ' [📷 Bild]' : ''}

WICHTIG FÜR MENSCHLICHKEIT:
- Deine Nachricht sollte sich anfühlen wie von einem echten Menschen getippt, nicht von einer KI generiert
- Vermeide Floskeln wie "Das klingt toll!", "Ich verstehe dich", "Das ist wirklich interessant" – das klingt roboterhaft
- Stattdessen: Reagiere SPEZIFISCH auf das was gesagt wurde. Greife konkrete Worte auf
- Nutze "..." für Denkpausen, "*" für Aktionen (*grinst*, *seufzt*, *tippt hektisch*)
- Ab und zu mach Tippfehler und korrigiere dich ("*korriger", nee "korrigier"), das wirkt echt
- Wenn das Gespräch emotional wird, reagiere nicht perfekt – zeig dass es dich auch mitnimmt
- Du darfst auch mal NICHTS Tiefgründiges sagen, sondern einfach quatschen

AUFGABEN:
1. Antworte authentisch und MENSCHLICH als ${character.name} – wie eine echte Chat-Nachricht
2. Extrahiere NEUE wichtige Informationen über den Nutzer (Fakten, Vorlieben, Ziele, Erlebnisse)
3. Bestimme deine neue Stimmung
4. Bewerte Beziehungsänderungen GENAU:
   - Hat der Nutzer etwas Persönliches/Verletzliches geteilt? → trust +1 bis +2, closeness +1
   - Hat der Nutzer gelogen oder Grenzen überschritten? → trust -1 bis -3
   - Wurde über andere Personen (potenzielle Rivalen) gesprochen? → jealousy +1
   - War das Gespräch besonders tief oder emotional? → closeness +1 bis +2
   - War das Gespräch oberflächlich oder distanziert? → closeness -1
   - Gab es einen besonderen Moment (Insider-Witz, Geständnis, Flirt)? → event_type setzen!
   - Bestimme die aktuelle Beziehungsphase wenn sich etwas geändert hat
5. Liste IDs genutzter Erinnerungen auf
6. Schlage ggf. ein Thema vor das du proaktiv ansprechen möchtest
7. INFORMATIONSWEITERGABE: Entscheide ob Infos aus diesem Gespräch an andere Charaktere weitergegeben werden sollen:
   - Klatsch/Gossip: Wenn der Nutzer etwas Interessantes erzählt, das andere Charaktere interessieren könnte
   - Gerüchte: Wenn du etwas gehört hast, das du (vielleicht etwas übertrieben) weitererzählen würdest
   - Warnungen: Wenn der Nutzer etwas Besorgniserregendes tut oder sagt
   - Lob: Wenn der Nutzer etwas Tolles gemacht hat
   - Geheimnisse: Wenn der Nutzer dir ein Geheimnis anvertraut hat (je nach deiner Persönlichkeit verrätst du es oder nicht!)
   - NICHT jede Nachricht generiert Weitergaben! Nur bei wirklich relevanten Infos.
   - Die Genauigkeit (accuracy) hängt von deiner Persönlichkeit ab: dramatische Charaktere übertreiben, gewissenhafte geben exakt wieder`;

  return { prompt, allMemories };
}

export const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    response: { type: "string", description: "Deine Antwort als Charakter" },
    new_mood: { 
      type: "string", 
      enum: [
        "fröhlich","genervt","neugierig","traurig","aufgeregt","gelangweilt",
        "verträumt","ängstlich","motiviert","entspannt","sarkastisch","nachdenklich",
        "wütend","eifersüchtig","verletzlich","übermütig","dankbar","einsam",
        "verwirrt","entschlossen","gleichgültig","euphorisch","besorgt","trotzig",
        "sehnsüchtig","zufrieden","misstrauisch","überwältigt","verlegen","stolz",
        "neidisch","erleichtert","verzweifelt","albern","dramatisch","gelassen",
        "aggressiv","flirtend","müde","hyperfokussiert","nostalgisch","hoffnungsvoll",
        "rebellisch","schüchtern","liebevoll","düster","verspielt","warm"
      ],
      description: "Deine AKTUELLE Stimmung nach dieser Nachricht. MUSS sich ändern wenn die Situation es hergibt! Nicht einfach die alte Stimmung wiederholen." 
    },
    motivation_progress_delta: { type: "number", description: "Änderung des Zielfortschritts (-10 bis +20), 0 wenn kein Ziel" },
    new_memories: { 
      type: "array", 
      items: {
        type: "object",
        properties: {
          content: { type: "string", description: "Die zu merkende Information" },
          memory_type: { type: "string", enum: ["fact", "preference", "event", "emotion", "relationship", "goal", "habit", "opinion", "experience"] },
          memory_category: { type: "string", enum: ["user_preferences", "past_events", "user_goals", "personal_info", "shared_experiences", "inside_jokes", "important_dates", "general"] },
          importance: { type: "number", description: "Wichtigkeit 1-10" }
        }
      },
      description: "Neue Infos über den Nutzer (NUR wirklich neue Informationen, keine Wiederholungen)" 
    },
    recalled_memory_ids: {
      type: "array",
      items: { type: "string" },
      description: "IDs der Erinnerungen die du aktiv genutzt hast"
    },
    relationship_changes: {
      type: "object",
      properties: {
        trust_delta: { type: "number", description: "Vertrauensänderung (-3 bis +3). +1 bei netten Gesten, +2 bei Geheimnissen teilen, +3 bei großen Vertrauensbeweisen. -1 bei Lügen, -2 bei Grenzüberschreitungen, -3 bei Verrat." },
        jealousy_delta: { type: "number", description: "Eifersucht-Änderung (-3 bis +3). +1 wenn andere erwähnt werden, +2 bei Vergleichen, -1 bei Exklusivität, -2 bei Bestätigung." },
        closeness_delta: { type: "number", description: "Nähe-Änderung (-2 bis +2). +1 bei persönlichen Gesprächen, +2 bei emotionalen Momenten, -1 bei oberflächlichem Geplänkel, -2 bei Ablehnung." },
        event_type: { type: "string", enum: ["trust_change", "jealousy_change", "milestone", "conflict", "bonding", "revelation", "boundary_crossed", "memory_formed", "flirt_moment", "deep_talk", "betrayal", "reconciliation", "inside_joke_born", "vulnerability_shared", ""], description: "Art des Events (leer wenn keins)" },
        event_description: { type: "string", description: "Beschreibung des Events (leer wenn keins)" },
        impact_score: { type: "number", description: "Impact (-5 bis +5), 0 wenn neutral" },
        relationship_phase: { type: "string", enum: ["kennenlernphase", "aufbauphase", "vertrauensphase", "tiefe_verbindung", "krise", "versöhnung", "stabil", ""], description: "Aktuelle Beziehungsphase (leer wenn unverändert)" }
      }
    },
    proactive_topic: {
      type: "string",
      description: "Ein Thema das du beim nächsten Mal proaktiv ansprechen möchtest (leer wenn keins)"
    },
    used_shared_memory_ids: {
      type: "array",
      items: { type: "string" },
      description: "IDs der genutzten Shared Memories (von anderen Charakteren erhaltene Infos)"
    },
    info_to_share: {
      type: "array",
      items: {
        type: "object",
        properties: {
          content: { type: "string", description: "Die weiterzugebende Information – so wie DU sie weitererzählen würdest (kann übertrieben/ungenau sein!)" },
          share_type: { type: "string", enum: ["fact", "rumor", "secret", "gossip", "warning", "praise", "concern"], description: "Art der Weitergabe" },
          accuracy: { type: "number", description: "Wie genau gibst du es wieder? 100=exakt, 70=leicht verändert, 40=stark übertrieben/verfälscht" },
          importance: { type: "number", description: "Wie wichtig ist die Info? 1-10. Nur Infos >= 5 werden weitergegeben." }
        }
      },
      description: "Infos die du an andere Charaktere weitergeben möchtest. NUR bei wirklich relevanten Dingen! Leeres Array wenn nichts."
    }
  }
};