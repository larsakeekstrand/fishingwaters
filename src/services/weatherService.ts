export interface WeatherData {
  time: string;
  pressure: number;
  windSpeed?: number;
  temperature?: number;
}

export interface WeatherResult {
  historical: WeatherData[];
  forecast: WeatherData[];
}

const WEATHER_API_BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0';
const HISTORICAL_API_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export class WeatherService {
  private static cache = new Map<string, { data: WeatherResult; timestamp: number }>();
  private static CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static async fetchWeatherData(lat: number, lon: number): Promise<WeatherResult> {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const [historicalResponse, forecastResponse] = await Promise.all([
        this.fetchHistoricalData(lat, lon),
        this.fetchForecastData(lat, lon)
      ]);

      const weatherData: WeatherResult = {
        historical: historicalResponse,
        forecast: forecastResponse
      };

      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  private static async fetchHistoricalData(lat: number, lon: number): Promise<WeatherData[]> {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() - 2);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 5);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const response = await fetch(
      `${HISTORICAL_API_BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${endDateStr}&hourly=pressure_msl,temperature_2m,wind_speed_10m`
    );

    if (!response.ok) {
      throw new Error(`Historical API error: ${response.status}`);
    }

    const data = await response.json();
    return this.processHistoricalData(data);
  }

  private static async fetchForecastData(lat: number, lon: number): Promise<WeatherData[]> {
    const response = await fetch(
      `${WEATHER_API_BASE_URL}/compact?lat=${lat}&lon=${lon}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return this.processForecastData(data);
  }

  private static processHistoricalData(openMeteoData: any): WeatherData[] {
    const times = openMeteoData.hourly?.time || [];
    const pressures = openMeteoData.hourly?.pressure_msl || [];
    const temperatures = openMeteoData.hourly?.temperature_2m || [];
    const windSpeeds = openMeteoData.hourly?.wind_speed_10m || [];

    const dailyAverages = new Map<string, {
      pressureSum: number; pressureCount: number;
      tempSum: number; tempCount: number;
      windSum: number; windCount: number;
    }>();

    for (let i = 0; i < times.length; i++) {
      const date = times[i].split('T')[0];
      const existing = dailyAverages.get(date) || {
        pressureSum: 0, pressureCount: 0,
        tempSum: 0, tempCount: 0,
        windSum: 0, windCount: 0,
      };

      if (pressures[i] != null) {
        existing.pressureSum += pressures[i];
        existing.pressureCount += 1;
      }
      if (temperatures[i] != null) {
        existing.tempSum += temperatures[i];
        existing.tempCount += 1;
      }
      if (windSpeeds[i] != null) {
        existing.windSum += windSpeeds[i];
        existing.windCount += 1;
      }

      dailyAverages.set(date, existing);
    }

    return Array.from(dailyAverages.entries())
      .map(([date, d]) => ({
        time: `${date}T12:00:00Z`,
        pressure: d.pressureCount > 0 ? Math.round((d.pressureSum / d.pressureCount) * 10) / 10 : 0,
        temperature: d.tempCount > 0 ? Math.round((d.tempSum / d.tempCount) * 10) / 10 : undefined,
        windSpeed: d.windCount > 0 ? Math.round((d.windSum / d.windCount) * 10) / 10 : undefined,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  private static processForecastData(metNoData: any): WeatherData[] {
    const timeseries = metNoData.properties?.timeseries || [];
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 5);

    const forecast: WeatherData[] = [];
    for (const entry of timeseries) {
      const entryDate = new Date(entry.time);
      if (entryDate <= endDate && entry.data?.instant?.details?.air_pressure_at_sea_level) {
        const details = entry.data.instant.details;
        forecast.push({
          time: entry.time,
          pressure: details.air_pressure_at_sea_level,
          windSpeed: details.wind_speed ?? undefined,
          temperature: details.air_temperature ?? undefined,
        });
      }
    }

    return this.aggregateToDailyAverages(forecast).slice(0, 5);
  }

  private static aggregateToDailyAverages(hourlyData: WeatherData[]): WeatherData[] {
    const dailyMap = new Map<string, {
      pressureSum: number; pressureCount: number;
      tempSum: number; tempCount: number;
      windSum: number; windCount: number;
    }>();

    for (const entry of hourlyData) {
      const date = entry.time.split('T')[0];
      const existing = dailyMap.get(date) || {
        pressureSum: 0, pressureCount: 0,
        tempSum: 0, tempCount: 0,
        windSum: 0, windCount: 0,
      };

      existing.pressureSum += entry.pressure;
      existing.pressureCount += 1;
      if (entry.temperature != null) {
        existing.tempSum += entry.temperature;
        existing.tempCount += 1;
      }
      if (entry.windSpeed != null) {
        existing.windSum += entry.windSpeed;
        existing.windCount += 1;
      }

      dailyMap.set(date, existing);
    }

    return Array.from(dailyMap.entries()).map(([date, d]) => ({
      time: `${date}T12:00:00Z`,
      pressure: Math.round((d.pressureSum / d.pressureCount) * 10) / 10,
      temperature: d.tempCount > 0 ? Math.round((d.tempSum / d.tempCount) * 10) / 10 : undefined,
      windSpeed: d.windCount > 0 ? Math.round((d.windSum / d.windCount) * 10) / 10 : undefined,
    }));
  }
}
