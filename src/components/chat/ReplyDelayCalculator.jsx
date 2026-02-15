/**
 * Calculates a realistic reply delay based on character traits and current time.
 * Returns delay in milliseconds.
 */
export function calculateReplyDelay(character) {
  const now = new Date();
  const hour = now.getHours();

  let baseDelay = 3000; // 3 seconds minimum

  // Time of day factors (night = slower)
  if (hour >= 0 && hour < 7) {
    // Sleeping hours - very slow or "not available"
    baseDelay += randomBetween(30000, 120000); // 30s - 2min
  } else if (hour >= 7 && hour < 9) {
    // Morning routine
    baseDelay += randomBetween(10000, 40000); // 10-40s
  } else if (hour >= 9 && hour < 17) {
    // Work hours
    baseDelay += randomBetween(8000, 60000); // 8s - 1min
  } else if (hour >= 17 && hour < 22) {
    // Evening - more available
    baseDelay += randomBetween(2000, 15000); // 2-15s
  } else {
    // Late evening
    baseDelay += randomBetween(5000, 30000); // 5-30s
  }

  // Occupation factor
  const occupation = (character.occupation || '').toLowerCase();
  const busyJobs = ['arzt', 'doctor', 'chirurg', 'pilot', 'manager', 'ceo', 'anwalt', 'richter', 'lehrer', 'professor', 'polizist', 'feuerwehr', 'notarzt', 'krankenschwester'];
  const relaxedJobs = ['künstler', 'artist', 'student', 'freelancer', 'influencer', 'blogger', 'musiker', 'gamer', 'streamer', 'schriftsteller', 'autor'];

  if (busyJobs.some(j => occupation.includes(j))) {
    // Busy during work hours
    if (hour >= 9 && hour < 17) {
      baseDelay += randomBetween(15000, 90000); // extra 15s-1.5min
    }
  } else if (relaxedJobs.some(j => occupation.includes(j))) {
    // More available
    baseDelay = Math.max(2000, baseDelay * 0.5);
  }

  // Category factor
  if (character.category === 'Assistent' || character.category === 'Experte') {
    baseDelay = Math.max(1000, baseDelay * 0.3); // Assistants reply fast
  } else if (character.category === 'Berühmtheit') {
    baseDelay += randomBetween(10000, 45000); // Celebrities are busy
  } else if (character.category === 'Partner' || character.category === 'Freund') {
    baseDelay = Math.max(2000, baseDelay * 0.6); // Close relationships reply faster
  }

  // Mood factor
  if (character.current_mood === 'genervt' || character.current_mood === 'gelangweilt') {
    baseDelay += randomBetween(5000, 20000); // slower when annoyed/bored
  } else if (character.current_mood === 'aufgeregt' || character.current_mood === 'fröhlich') {
    baseDelay = Math.max(1500, baseDelay * 0.6); // faster when excited
  }

  // Age factor (older = slightly slower)
  const age = parseInt(character.age);
  if (!isNaN(age)) {
    if (age > 60) baseDelay += randomBetween(5000, 15000);
    else if (age < 20) baseDelay = Math.max(1500, baseDelay * 0.7); // teens reply fast
  }

  // Cap at reasonable max (3 minutes)
  return Math.min(baseDelay, 180000);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a short status text explaining why the character is slow.
 */
export function getDelayReason(character) {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 0 && hour < 7) {
    return 'schläft vermutlich...';
  }
  if (hour >= 7 && hour < 9) {
    return 'gerade aufgestanden...';
  }

  const occupation = (character.occupation || '').toLowerCase();
  const busyJobs = ['arzt', 'doctor', 'chirurg', 'pilot', 'manager', 'ceo', 'anwalt', 'richter', 'lehrer', 'professor', 'polizist', 'feuerwehr'];

  if (hour >= 9 && hour < 17 && busyJobs.some(j => occupation.includes(j))) {
    return `ist gerade bei der Arbeit${character.occupation ? ` (${character.occupation})` : ''}...`;
  }

  if (character.current_mood === 'genervt') return 'scheint beschäftigt...';
  if (character.current_mood === 'gelangweilt') return 'hat gerade keine Lust...';

  if (character.category === 'Berühmtheit') return 'ist sehr beschäftigt...';

  return 'online';
}