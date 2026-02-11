import { getMoonPhase } from '../moonPhase';

describe('getMoonPhase', () => {
  it('should return a phase between 0 and 1', () => {
    const result = getMoonPhase(new Date('2025-07-20'));
    expect(result.phase).toBeGreaterThanOrEqual(0);
    expect(result.phase).toBeLessThan(1);
  });

  it('should return a fishing score between 0 and 1', () => {
    const result = getMoonPhase(new Date('2025-07-20'));
    expect(result.fishingScore).toBeGreaterThanOrEqual(0);
    expect(result.fishingScore).toBeLessThanOrEqual(1);
  });

  it('should return a Swedish phase name', () => {
    const validNames = [
      'Nymåne', 'Tilltagande skära', 'Första kvarteret',
      'Tilltagande halvmåne', 'Fullmåne', 'Avtagande halvmåne',
      'Sista kvarteret', 'Avtagande skära',
    ];
    const result = getMoonPhase(new Date('2025-07-20'));
    expect(validNames).toContain(result.phaseName);
  });

  it('should return high fishing score near new moon', () => {
    // Jan 29, 2025 is close to a new moon
    const result = getMoonPhase(new Date('2025-01-29'));
    expect(result.fishingScore).toBeGreaterThan(0.7);
  });

  it('should return different phases for different dates', () => {
    const r1 = getMoonPhase(new Date('2025-07-10'));
    const r2 = getMoonPhase(new Date('2025-07-20'));
    expect(r1.phase).not.toBeCloseTo(r2.phase, 1);
  });

  it('should handle dates before the reference new moon', () => {
    const result = getMoonPhase(new Date('1999-01-01'));
    expect(result.phase).toBeGreaterThanOrEqual(0);
    expect(result.phase).toBeLessThan(1);
  });
});
