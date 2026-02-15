/**
 * Determines if a character is currently "online" / available.
 * Uses a seeded pseudo-random based on character ID + current hour block
 * so the result is consistent within time windows but varies per character.
 */

function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs((Math.sin(hash) * 10000) % 1);
}

export function getCharacterAvailability(character) {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  
  // Create a seed that changes every ~30 minutes for variety
  const timeBlock = Math.floor(now.getTime() / (30 * 60 * 1000));
  const seed = `${character.id || character.name}-${timeBlock}`;
  const rand = seededRandom(seed);
  
  // Assistants/Experten are always online
  if (character.category === 'Assistent' || character.category === 'Experte') {
    return { status: 'online', label: 'online' };
  }

  // Night hours (0-6): most characters are offline/sleeping
  if (hour >= 0 && hour < 6) {
    if (rand < 0.85) return { status: 'offline', label: 'schläft' };
    if (rand < 0.95) return { status: 'away', label: 'zuletzt online um ' + formatLastSeen(hour) };
    return { status: 'online', label: 'online' }; // night owl
  }

  // Early morning (6-8): waking up
  if (hour >= 6 && hour < 8) {
    if (rand < 0.4) return { status: 'offline', label: 'schläft noch' };
    if (rand < 0.7) return { status: 'away', label: 'gerade aufgewacht' };
    return { status: 'online', label: 'online' };
  }

  // Work hours (8-17)
  if (hour >= 8 && hour < 17) {
    const occupation = (character.occupation || '').toLowerCase();
    const busyJobs = ['arzt', 'doctor', 'chirurg', 'pilot', 'manager', 'ceo', 'anwalt', 'richter', 'lehrer', 'professor', 'polizist', 'feuerwehr', 'notarzt', 'krankenschwester'];
    const isBusy = busyJobs.some(j => occupation.includes(j));
    
    if (isBusy) {
      // Busy jobs: rarely online during work
      if (rand < 0.6) return { status: 'offline', label: `bei der Arbeit${character.occupation ? ` (${character.occupation})` : ''}` };
      if (rand < 0.85) return { status: 'away', label: 'kurze Pause' };
      return { status: 'online', label: 'online' };
    }
    
    // Weekend = more available
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (rand < 0.15) return { status: 'offline', label: 'unterwegs' };
      if (rand < 0.35) return { status: 'away', label: 'beschäftigt' };
      return { status: 'online', label: 'online' };
    }
    
    // Normal weekday
    if (rand < 0.3) return { status: 'offline', label: 'beschäftigt' };
    if (rand < 0.55) return { status: 'away', label: 'kurz abwesend' };
    return { status: 'online', label: 'online' };
  }

  // Evening (17-22): most available time
  if (hour >= 17 && hour < 22) {
    if (rand < 0.1) return { status: 'offline', label: 'unterwegs' };
    if (rand < 0.25) return { status: 'away', label: 'kurz weg' };
    return { status: 'online', label: 'online' };
  }

  // Late evening (22-24): winding down
  if (rand < 0.3) return { status: 'offline', label: 'schläft schon' };
  if (rand < 0.5) return { status: 'away', label: 'geht gleich schlafen' };
  return { status: 'online', label: 'online' };
}

function formatLastSeen(currentHour) {
  const lastSeenHour = Math.max(0, currentHour - Math.floor(Math.random() * 3 + 1));
  return `${String(lastSeenHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
}

// Mood affects availability
function getMoodAvailabilityModifier(character) {
  const mood = character.current_mood;
  if (!mood) return 0;
  
  // Negative moods = less likely to respond
  const avoidMoods = ['wütend', 'genervt', 'trotzig', 'aggressiv', 'gleichgültig', 'distanziert', 'müde'];
  if (avoidMoods.includes(mood)) return 0.3; // 30% less likely to be available
  
  // Positive/engaged moods = more likely to respond
  const engagedMoods = ['fröhlich', 'aufgeregt', 'neugierig', 'liebevoll', 'flirtend', 'verspielt', 'warm'];
  if (engagedMoods.includes(mood)) return -0.2; // 20% more likely to be available
  
  return 0;
}

/**
 * Calculates a realistic reply delay based on character traits, availability, and context.
 * Returns delay in milliseconds.
 */
export function calculateReplyDelay(character, isRepeatMessage = false) {
  const availability = getCharacterAvailability(character);
  
  // If character is offline, LONG delay (unless repeat message)
  if (availability.status === 'offline' && !isRepeatMessage) {
    return randomBetween(120000, 600000); // 2-10 minutes
  }
  
  // If character is away
  if (availability.status === 'away' && !isRepeatMessage) {
    return randomBetween(30000, 180000); // 30s - 3min
  }
  
  // If user is asking again (repeat/follow-up), respond faster
  if (isRepeatMessage) {
    return randomBetween(2000, 8000); // 2-8 seconds - they noticed you're waiting
  }
  
  // Online - normal delay based on traits
  let baseDelay = randomBetween(2000, 8000);
  
  // Mood modifier
  const mood = character.current_mood;
  if (mood === 'genervt' || mood === 'wütend' || mood === 'trotzig') {
    baseDelay += randomBetween(10000, 45000); // annoyed = slower, might "ignore"
  } else if (mood === 'gleichgültig' || mood === 'gelangweilt') {
    baseDelay += randomBetween(8000, 30000);
  } else if (mood === 'aufgeregt' || mood === 'fröhlich' || mood === 'flirtend') {
    baseDelay = Math.max(1500, baseDelay * 0.5); // excited = fast replies
  } else if (mood === 'müde') {
    baseDelay += randomBetween(10000, 40000);
  }
  
  // Relationship closeness
  const trust = character.trust_level || 5;
  if (trust >= 8) {
    baseDelay = Math.max(1500, baseDelay * 0.6); // high trust = faster
  } else if (trust <= 3) {
    baseDelay += randomBetween(5000, 20000); // low trust = slower
  }
  
  // Category
  if (character.category === 'Assistent' || character.category === 'Experte') {
    baseDelay = Math.max(1000, baseDelay * 0.2);
  } else if (character.category === 'Berühmtheit') {
    baseDelay += randomBetween(15000, 60000);
  }
  
  // Age factor
  const age = parseInt(character.age);
  if (!isNaN(age)) {
    if (age > 60) baseDelay += randomBetween(5000, 15000);
    else if (age < 20) baseDelay = Math.max(1500, baseDelay * 0.6);
  }

  return Math.min(baseDelay, 300000); // cap 5 min
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a short status text explaining why the character is slow.
 */
export function getDelayReason(character) {
  const availability = getCharacterAvailability(character);
  
  if (availability.status === 'offline') {
    return availability.label;
  }
  if (availability.status === 'away') {
    return availability.label;
  }
  
  // Online but slow due to mood
  const mood = character.current_mood;
  if (mood === 'genervt') return 'hat gerade keine Lust zu antworten...';
  if (mood === 'wütend') return 'ist sauer...';
  if (mood === 'trotzig') return 'ignoriert dich vielleicht...';
  if (mood === 'gleichgültig') return 'liest, antwortet aber nicht sofort...';
  if (mood === 'müde') return 'ist müde, antwortet langsam...';
  if (mood === 'gelangweilt') return 'scrollt durch andere Chats...';
  
  return 'tippt...';
}

/**
 * Detects if user is sending a follow-up/repeat message (nagging).
 * If user sends multiple short messages, character should respond faster.
 */
export function isRepeatNag(messages, newContent) {
  if (!messages || messages.length < 1) return false;
  
  // Check last 3 messages
  const recent = messages.slice(-3);
  const recentUserMsgs = recent.filter(m => m.role === 'user');
  
  // If last 2+ messages are from user without character reply = they're waiting
  if (recentUserMsgs.length >= 2) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'user') return true;
  }
  
  // Short follow-up messages like "hallo?", "??", "bist du da?"
  const nagPatterns = /^(\?\?+|hallo\??|hey\??|bist du da|antwort|wo bist du|ignorierst du mich|hello|hm+|ey|alter|erde an|schläfst du)/i;
  if (nagPatterns.test(newContent.trim())) return true;
  
  return false;
}