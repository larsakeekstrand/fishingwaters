import { vi, Mock } from 'vitest';
import { WeatherService } from '../weatherService';

describe('WeatherService', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    // Clear the cache before each test
    (WeatherService as any).cache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchPressureData', () => {
    it('should fetch and process pressure data correctly', async () => {
      const mockHistoricalResponse = {
        hourly: {
          time: ['2025-07-17T00:00', '2025-07-17T12:00', '2025-07-18T00:00', '2025-07-18T12:00'],
          pressure_msl: [1013.2, 1014.1, 1013.8, 1014.5],
        },
      };

      const mockForecastResponse = {
        properties: {
          timeseries: [
            {
              time: '2025-07-22T12:00:00Z',
              data: {
                instant: {
                  details: {
                    air_pressure_at_sea_level: 1013.2,
                  },
                },
              },
            },
            {
              time: '2025-07-23T12:00:00Z',
              data: {
                instant: {
                  details: {
                    air_pressure_at_sea_level: 1014.0,
                  },
                },
              },
            },
          ],
        },
      };

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistoricalResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockForecastResponse,
        });

      const result = await WeatherService.fetchPressureData(59.3293, 18.0686);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('historical');
      expect(result).toHaveProperty('forecast');
      expect(result.historical.length).toBeGreaterThan(0);
      expect(result.forecast.length).toBeGreaterThan(0);
    });

    it('should handle API errors', async () => {
      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ properties: { timeseries: [] } }),
        });

      await expect(WeatherService.fetchPressureData(59.3293, 18.0686)).rejects.toThrow(
        'Historical API error: 500'
      );
    });

    it('should use cached data when available', async () => {
      const mockHistoricalResponse = { hourly: { time: [], pressure_msl: [] } };
      const mockForecastResponse = { properties: { timeseries: [] } };

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistoricalResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockForecastResponse,
        });

      // First call
      await WeatherService.fetchPressureData(59.33, 18.07);

      // Second call should use cache
      await WeatherService.fetchPressureData(59.33, 18.07);

      expect(global.fetch).toHaveBeenCalledTimes(2); // Only called once for first request
    });
  });
});
