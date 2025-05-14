import { fetchWeatherData, getWeatherIcon } from '../weatherService';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock fetch API
global.fetch = jest.fn();

describe('weatherService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('fetchWeatherData', () => {
    it('should return null if lake data is invalid', async () => {
      const result = await fetchWeatherData({} as GeoJsonFeature);
      expect(result).toBeNull();
    });

    it('should fetch and process weather data correctly', async () => {
      // Mock successful API response
      const mockWeatherData = {
        properties: {
          timeseries: [
            {
              time: '2023-05-01T12:00:00Z',
              data: {
                instant: {
                  details: {
                    air_temperature: 15.2,
                    wind_speed: 5.1,
                    relative_humidity: 65
                  }
                },
                next_1_hours: {
                  summary: {
                    symbol_code: 'partlycloudy_day'
                  },
                  details: {
                    precipitation_amount: 0.2
                  }
                }
              }
            }
          ]
        }
      };

      // Mock a valid GeoJsonFeature
      const mockLake: GeoJsonFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [18.0592, 59.3302] // [longitude, latitude]
        },
        properties: {
          name: 'Test Lake',
          county: 'Test County',
          location: 'Test Location',
          maxDepth: 10,
          area: 100,
          elevation: 50
        }
      };

      // Mock the fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      });

      const result = await fetchWeatherData(mockLake);

      // Verify fetch was called with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.3302&lon=18.0592',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.any(String)
          })
        })
      );

      // Verify result
      expect(result).toEqual({
        temperature: 15.2,
        windSpeed: 5.1,
        humidity: 65,
        symbolCode: 'partlycloudy_day',
        precipitation: 0.2,
        time: expect.any(String),
        location: 'Test Lake'
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock a valid GeoJsonFeature
      const mockLake: GeoJsonFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [18.0592, 59.3302]
        },
        properties: {
          name: 'Test Lake',
          county: 'Test County',
          location: 'Test Location',
          maxDepth: 10,
          area: 100,
          elevation: 50
        }
      };

      // Mock a failed fetch
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await fetchWeatherData(mockLake);
      expect(result).toBeNull();
    });
  });

  describe('getWeatherIcon', () => {
    it('should return the correct icon for known symbol codes', () => {
      expect(getWeatherIcon('clearsky_day')).toBe('wb_sunny');
      expect(getWeatherIcon('rain')).toBe('rainy');
      expect(getWeatherIcon('cloudy')).toBe('cloud');
    });

    it('should return a default icon for unknown symbol codes', () => {
      expect(getWeatherIcon('unknown_code')).toBe('cloud');
    });
  });
});