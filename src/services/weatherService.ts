interface WeatherData {
  time: string;
  pressure: number;
}

interface PressureData {
  historical: WeatherData[];
  forecast: WeatherData[];
}

const WEATHER_API_BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0';
const USER_AGENT = 'FishingWatersApp/1.0 (https://github.com/larsakeekstrand/fishingwaters)';

export class WeatherService {
  private static cache = new Map<string, { data: PressureData; timestamp: number }>();
  private static CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static async fetchPressureData(lat: number, lon: number): Promise<PressureData> {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
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
      const pressureData = this.processPressureData(data);
      
      this.cache.set(cacheKey, { data: pressureData, timestamp: Date.now() });
      return pressureData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  private static processPressureData(apiData: any): PressureData {
    const timeseries = apiData.properties?.timeseries || [];
    const now = new Date();
    
    // Generate historical data (since API doesn't provide it)
    // In a real app, you'd store this data over time
    const historical: WeatherData[] = [];
    for (let i = 5; i >= 1; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      historical.push({
        time: date.toISOString(),
        pressure: this.generateHistoricalPressure(1013, i),
      });
    }

    // Extract forecast data (next 5 days)
    const forecast: WeatherData[] = [];
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 5);

    for (const entry of timeseries) {
      const entryDate = new Date(entry.time);
      if (entryDate <= endDate && entry.data?.instant?.details?.air_pressure_at_sea_level) {
        forecast.push({
          time: entry.time,
          pressure: entry.data.instant.details.air_pressure_at_sea_level,
        });
      }
    }

    // Aggregate to daily averages
    const dailyForecast = this.aggregateToDailyAverages(forecast);

    return {
      historical,
      forecast: dailyForecast.slice(0, 5),
    };
  }

  private static generateHistoricalPressure(basePressure: number, daysAgo: number): number {
    // Simple simulation with some variation
    const variation = Math.sin(daysAgo * 0.5) * 10;
    return Math.round((basePressure + variation) * 10) / 10;
  }

  private static aggregateToDailyAverages(hourlyData: WeatherData[]): WeatherData[] {
    const dailyMap = new Map<string, { sum: number; count: number }>();

    for (const entry of hourlyData) {
      const date = entry.time.split('T')[0];
      const existing = dailyMap.get(date) || { sum: 0, count: 0 };
      existing.sum += entry.pressure;
      existing.count += 1;
      dailyMap.set(date, existing);
    }

    return Array.from(dailyMap.entries()).map(([date, { sum, count }]) => ({
      time: `${date}T12:00:00Z`,
      pressure: Math.round((sum / count) * 10) / 10,
    }));
  }
}