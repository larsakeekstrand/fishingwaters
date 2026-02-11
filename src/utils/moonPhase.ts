interface MoonPhaseResult {
  phase: number;
  phaseName: string;
  fishingScore: number;
}

const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();
const SYNODIC_MONTH = 29.53059;
const MS_PER_DAY = 86400000;

export function getMoonPhase(date: Date): MoonPhaseResult {
  const diffMs = date.getTime() - KNOWN_NEW_MOON;
  const diffDays = diffMs / MS_PER_DAY;
  const phase = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH / SYNODIC_MONTH;

  const phaseName = getPhaseName(phase);
  const fishingScore = (Math.cos(phase * 2 * Math.PI * 2) + 1) / 2;

  return { phase, phaseName, fishingScore };
}

function getPhaseName(phase: number): string {
  if (phase < 0.0625 || phase >= 0.9375) return 'Nymåne';
  if (phase < 0.1875) return 'Tilltagande skära';
  if (phase < 0.3125) return 'Första kvarteret';
  if (phase < 0.4375) return 'Tilltagande halvmåne';
  if (phase < 0.5625) return 'Fullmåne';
  if (phase < 0.6875) return 'Avtagande halvmåne';
  if (phase < 0.8125) return 'Sista kvarteret';
  return 'Avtagande skära';
}
