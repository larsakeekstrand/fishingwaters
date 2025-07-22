import { WeatherService } from '../weatherService';

describe('WeatherService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    // Clear the cache before each test
    (WeatherService as any).cache.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchPressureData', () => {
    it('should fetch and process pressure data correctly', async () => {
      const mockApiResponse = {
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
              time: '2025-07-22T13:00:00Z',
              data: {
                instant: {
                  details: {
                    air_pressure_at_sea_level: 1013.5,
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

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await WeatherService.fetchPressureData(59.3293, 18.0686);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.3293&lon=18.0686',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      expect(result).toHaveProperty('historical');
      expect(result).toHaveProperty('forecast');
      expect(result.historical).toHaveLength(5);
      expect(result.forecast.length).toBeGreaterThan(0);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(WeatherService.fetchPressureData(59.3293, 18.0686)).rejects.toThrow(
        'Weather API error: 500'
      );
    });

    it('should use cached data when available', async () => {
      const mockApiResponse = {
        properties: {
          timeseries: [],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      // First call
      await WeatherService.fetchPressureData(59.33, 18.07);

      // Second call should use cache
      await WeatherService.fetchPressureData(59.33, 18.07);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});