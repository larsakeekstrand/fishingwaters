import { fetchWeatherData, getWeatherIconUrl, formatTime } from '../weatherService';
import { WeatherData } from '../../types/WeatherTypes';

// Mock fetch globally
global.fetch = jest.fn();

describe('weatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchWeatherData', () => {
    const mockWeatherData: WeatherData = {
      properties: {
        timeseries: [
          {
            time: '2023-10-15T12:00:00Z',
            data: {
              instant: {
                details: {
                  air_temperature: 15.5,
                  relative_humidity: 75,
                  wind_speed: 5.2,
                  wind_from_direction: 180,
                },
              },
              next_6_hours: {
                summary: {
                  symbol_code: 'partlycloudy_day',
                },
                details: {
                  precipitation_amount: 0.5,
                },
              },
            },
          },
          {
            time: '2023-10-15T18:00:00Z',
            data: {
              instant: {
                details: {
                  air_temperature: 12.0,
                  relative_humidity: 80,
                  wind_speed: 3.8,
                  wind_from_direction: 200,
                },
              },
              next_6_hours: {
                summary: {
                  symbol_code: 'cloudy',
                },
                details: {
                  precipitation_amount: 1.2,
                },
              },
            },
          },
          {
            time: '2023-10-16T00:00:00Z',
            data: {
              instant: {
                details: {
                  air_temperature: 8.0,
                  relative_humidity: 85,
                  wind_speed: 2.5,
                  wind_from_direction: 220,
                },
              },
              next_6_hours: {
                summary: {
                  symbol_code: 'rain',
                },
                details: {
                  precipitation_amount: 0.8,
                },
              },
            },
          },
        ],
      },
    };

    it('fetches and processes weather data successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData,
      });

      const result = await fetchWeatherData(59.3293, 18.0686);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.3293&lon=18.0686',
        {
          headers: {
            'User-Agent': 'FishingWaters/1.0 (https://github.com/larsakeekstrand/fishingwaters)',
          },
        }
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        time: '2023-10-15T12:00:00Z',
        temperature: 16,
        symbolCode: 'partlycloudy_day',
        precipitation: 0.5,
        windSpeed: 19, // 5.2 m/s * 3.6 = 18.72, rounded to 19
        humidity: 75,
      });
      expect(result[1]).toEqual({
        time: '2023-10-15T18:00:00Z',
        temperature: 12,
        symbolCode: 'cloudy',
        precipitation: 1.2,
        windSpeed: 14, // 3.8 m/s * 3.6 = 13.68, rounded to 14
        humidity: 80,
      });
      expect(result[2]).toEqual({
        time: '2023-10-16T00:00:00Z',
        temperature: 8,
        symbolCode: 'rain',
        precipitation: 0.8,
        windSpeed: 9, // 2.5 m/s * 3.6 = 9
        humidity: 85,
      });
    });

    it('handles API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(fetchWeatherData(59.3293, 18.0686)).rejects.toThrow(
        'Weather API request failed: 404'
      );
    });

    it('handles network errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchWeatherData(59.3293, 18.0686)).rejects.toThrow('Network error');
    });
  });

  describe('getWeatherIconUrl', () => {
    it('returns correct icon URL for symbol code', () => {
      const url = getWeatherIconUrl('clearsky_day');
      expect(url).toBe('https://api.met.no/images/weathericons/svg/clearsky_day.svg');
    });

    it('handles different symbol codes', () => {
      const url = getWeatherIconUrl('rain');
      expect(url).toBe('https://api.met.no/images/weathericons/svg/rain.svg');
    });
  });

  describe('formatTime', () => {
    beforeEach(() => {
      // Mock the current date to October 15, 2023, 10:00
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-10-15T10:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('formats current time as "Nu"', () => {
      const result = formatTime('2023-10-15T12:00:00Z');
      expect(result).toBe('Nu');
    });

    it('formats tomorrow time correctly', () => {
      const result = formatTime('2023-10-16T14:00:00Z');
      expect(result).toBe('Imorgon 14:00');
    });

    it('formats other days with day name and time', () => {
      const result = formatTime('2023-10-17T16:00:00Z'); // Tuesday
      expect(result).toBe('Tis 16:00');
    });

    it('pads single digit hours', () => {
      const result = formatTime('2023-10-16T08:00:00Z');
      expect(result).toBe('Imorgon 08:00');
    });
  });
});