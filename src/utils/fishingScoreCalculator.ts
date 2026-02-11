import { getMoonPhase } from './moonPhase';

interface DailyWeather {
  time: string;
  pressure: number;
  windSpeed?: number;
  temperature?: number;
}

export interface DailyFishingScore {
  date: string;
  stars: number;
  rawScore: number;
  factors: {
    pressureTrend: number;
    wind: number;
    temperature: number;
    moonPhase: number;
    moonPhaseName: string;
  };
}

const WEIGHTS = {
  pressureTrend: 0.40,
  wind: 0.25,
  temperature: 0.15,
  moonPhase: 0.20,
};

export function calculateFishingScores(
  historical: DailyWeather[],
  forecast: DailyWeather[]
): DailyFishingScore[] {
  const allDays = [...historical, ...forecast];
  return allDays.map((day, index) => {
    const prevDay = index > 0 ? allDays[index - 1] : null;
    const pressureTrend = scorePressureTrend(day.pressure, prevDay?.pressure);
    const wind = scoreWind(day.windSpeed);
    const temperature = scoreTemperature(day.temperature);
    const moon = getMoonPhase(new Date(day.time));

    const rawScore =
      pressureTrend * WEIGHTS.pressureTrend +
      wind * WEIGHTS.wind +
      temperature * WEIGHTS.temperature +
      moon.fishingScore * WEIGHTS.moonPhase;

    return {
      date: day.time.split('T')[0],
      stars: rawScoreToStars(rawScore),
      rawScore,
      factors: {
        pressureTrend,
        wind,
        temperature,
        moonPhase: moon.fishingScore,
        moonPhaseName: moon.phaseName,
      },
    };
  });
}

function scorePressureTrend(current: number, previous: number | undefined): number {
  if (previous === undefined) return 0.5;
  const change = current - previous;
  if (change >= 0 && change <= 2) return 1.0;
  if (change > 2 && change <= 5) return 0.7;
  if (change < 0 && change >= -2) return 0.8;
  if (change < -2 && change >= -5) return 0.4;
  return 0.2;
}

function scoreWind(windSpeed: number | undefined): number {
  if (windSpeed === undefined) return 0.5;
  if (windSpeed >= 1 && windSpeed <= 4) return 1.0;
  if (windSpeed < 1) return 0.7;
  if (windSpeed <= 7) return 0.6;
  if (windSpeed <= 10) return 0.3;
  return 0.1;
}

function scoreTemperature(temp: number | undefined): number {
  if (temp === undefined) return 0.5;
  if (temp >= 10 && temp <= 20) return 1.0;
  if (temp >= 5 && temp < 10) return 0.7;
  if (temp > 20 && temp <= 25) return 0.7;
  if (temp >= 0 && temp < 5) return 0.4;
  if (temp > 25 && temp <= 30) return 0.4;
  return 0.2;
}

function rawScoreToStars(score: number): number {
  if (score >= 0.85) return 5;
  if (score >= 0.70) return 4;
  if (score >= 0.50) return 3;
  if (score >= 0.35) return 2;
  return 1;
}
