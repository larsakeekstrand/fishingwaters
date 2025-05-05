import { fetchWeather } from '../WeatherService';

// Mock fetch globally
global.fetch = jest.fn();

describe('WeatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchWeather', () => {
    it('should fetch weather data correctly', async () => {
      // Mock successful API response
      const mockResponse = {
        properties: {
          timeseries: [
            {
              data: {
                instant: {
                  details: {
                    air_temperature: 15.2,
                    wind_speed: 5.1,
                    wind_from_direction: 180.5,
                    relative_humidity: 75.3,
                  }
                },
                next_1_hours: {
                  details: {
                    precipitation_amount: 0.5,
                  },
                  summary: {
                    symbol_code: 'cloudy'
                  }
                }
              }
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchWeather(59.3293, 18.0686);

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.3293&lon=18.0686',
        {
          headers: {
            'User-Agent': 'FishingWaters/1.0 github.com/larsakeekstrand/fishingwaters',
          },
        }
      );

      // Verify data was processed correctly
      expect(result).toMatchObject({
        temperature: 15.2,
        windSpeed: 5.1,
        windDirection: 180.5,
        precipitation: 0.5,
        humidity: 75.3,
        weatherSymbol: 'cloudy',
        weatherDescription: 'Molnigt',
      });
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(fetchWeather(59.3293, 18.0686)).rejects.toThrow('Weather API error: 403 Forbidden');
    });
  });

  // We'll test the useWeather hook through components that use it
});