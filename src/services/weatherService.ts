interface WeatherData {
  time: string;
  pressure: number;
}

interface PressureData {
  historical: WeatherData[];
  forecast: WeatherData[];
}

const WEATHER_API_BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0';
const HISTORICAL_API_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';
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
      // Fetch historical data from Open-Meteo and forecast from met.no in parallel
      const [historicalResponse, forecastResponse] = await Promise.all([
        this.fetchHistoricalData(lat, lon),
        this.fetchForecastData(lat, lon)
      ]);

      const pressureData = {
        historical: historicalResponse,
        forecast: forecastResponse
      };
      
      this.cache.set(cacheKey, { data: pressureData, timestamp: Date.now() });
      return pressureData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  private static async fetchHistoricalData(lat: number, lon: number): Promise<WeatherData[]> {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() - 2); // Go back 2 days to avoid incomplete data
    
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 5); // Get 5 days of history

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const response = await fetch(
      `${HISTORICAL_API_BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${endDateStr}&hourly=pressure_msl`
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

    const dailyAverages = new Map<string, { sum: number; count: number }>();

    for (let i = 0; i < times.length; i++) {
      if (pressures[i] !== null && pressures[i] !== undefined) {
        const date = times[i].split('T')[0];
        const existing = dailyAverages.get(date) || { sum: 0, count: 0 };
        existing.sum += pressures[i];
        existing.count += 1;
        dailyAverages.set(date, existing);
      }
    }

    return Array.from(dailyAverages.entries())
      .map(([date, { sum, count }]) => ({
        time: `${date}T12:00:00Z`,
        pressure: Math.round((sum / count) * 10) / 10,
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
        forecast.push({
          time: entry.time,
          pressure: entry.data.instant.details.air_pressure_at_sea_level,
        });
      }
    }

    return this.aggregateToDailyAverages(forecast).slice(0, 5);
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