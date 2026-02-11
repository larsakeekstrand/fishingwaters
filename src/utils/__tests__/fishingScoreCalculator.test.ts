import { calculateFishingScores } from '../fishingScoreCalculator';

describe('calculateFishingScores', () => {
  const historical = [
    { time: '2025-07-17T12:00:00Z', pressure: 1013.2, windSpeed: 3, temperature: 15 },
    { time: '2025-07-18T12:00:00Z', pressure: 1014.0, windSpeed: 2, temperature: 16 },
    { time: '2025-07-19T12:00:00Z', pressure: 1014.5, windSpeed: 4, temperature: 14 },
  ];

  const forecast = [
    { time: '2025-07-20T12:00:00Z', pressure: 1015.0, windSpeed: 5, temperature: 18 },
    { time: '2025-07-21T12:00:00Z', pressure: 1014.8, windSpeed: 2, temperature: 17 },
  ];

  it('should return one score per day', () => {
    const scores = calculateFishingScores(historical, forecast);
    expect(scores).toHaveLength(5);
  });

  it('should return stars between 1 and 5', () => {
    const scores = calculateFishingScores(historical, forecast);
    for (const score of scores) {
      expect(score.stars).toBeGreaterThanOrEqual(1);
      expect(score.stars).toBeLessThanOrEqual(5);
    }
  });

  it('should include factor breakdown in each score', () => {
    const scores = calculateFishingScores(historical, forecast);
    for (const score of scores) {
      expect(score.factors).toHaveProperty('pressureTrend');
      expect(score.factors).toHaveProperty('wind');
      expect(score.factors).toHaveProperty('temperature');
      expect(score.factors).toHaveProperty('moonPhase');
      expect(score.factors).toHaveProperty('moonPhaseName');
    }
  });

  it('should extract date from time string', () => {
    const scores = calculateFishingScores(historical, forecast);
    expect(scores[0].date).toBe('2025-07-17');
    expect(scores[4].date).toBe('2025-07-21');
  });

  it('should handle missing wind and temperature gracefully', () => {
    const sparse = [
      { time: '2025-07-17T12:00:00Z', pressure: 1013.2 },
      { time: '2025-07-18T12:00:00Z', pressure: 1014.0 },
    ];
    const scores = calculateFishingScores(sparse, []);
    expect(scores).toHaveLength(2);
    expect(scores[0].factors.wind).toBe(0.5);
    expect(scores[0].factors.temperature).toBe(0.5);
  });

  it('should give high wind score for ideal wind speed', () => {
    const ideal = [
      { time: '2025-07-17T12:00:00Z', pressure: 1013.0, windSpeed: 3, temperature: 15 },
      { time: '2025-07-18T12:00:00Z', pressure: 1014.0, windSpeed: 3, temperature: 15 },
    ];
    const scores = calculateFishingScores(ideal, []);
    expect(scores[1].factors.wind).toBe(1.0);
  });

  it('should give low wind score for strong wind', () => {
    const windy = [
      { time: '2025-07-17T12:00:00Z', pressure: 1013.0, windSpeed: 12, temperature: 15 },
      { time: '2025-07-18T12:00:00Z', pressure: 1014.0, windSpeed: 12, temperature: 15 },
    ];
    const scores = calculateFishingScores(windy, []);
    expect(scores[1].factors.wind).toBe(0.1);
  });
});
