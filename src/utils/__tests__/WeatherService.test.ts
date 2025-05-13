import { fetchWeatherData, calculateFeelsLike, getWeatherDescription } from '../WeatherService';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock fetch
global.fetch = jest.fn();

describe('WeatherService', () => {
  const mockLake: GeoJsonFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [18.0686, 59.3293]
    },
    properties: {
      name: 'Test Lake',
      maxDepth: 10,
      area: 1000,
      county: 'Test County',
      location: 'Test Location',
      elevation: 50
    }
  };

  const mockSuccessResponse = {
    properties: {
      timeseries: [
        {
          data: {
            instant: {
              details: {
                air_temperature: 15.2,
                wind_speed: 5.5,
                wind_from_direction: 180,
                relative_humidity: 60,
                cloud_area_fraction: 45,
                ultraviolet_index_clear_sky: 3
              }
            },
            next_1_hours: {
              summary: {
                symbol_code: 'partlycloudy'
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch weather data successfully', async () => {
    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockSuccessResponse)
    });

    const result = await fetchWeatherData(mockLake);

    // Verify that fetch was called with the correct URL and headers
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.3293&lon=18.0686',
      {
        headers: {
          'User-Agent': 'FishingWaters/1.0 github.com/larsakeekstrand/fishingwaters'
        }
      }
    );

    // Verify that the correct data was extracted
    expect(result).toEqual(expect.objectContaining({
      temperature: 15.2,
      weatherSymbol: 'partlycloudy',
      weatherDescription: 'Delvis moln',
      windSpeed: 5.5,
      windDirection: 180,
      precipitation: 0.2,
      humidity: 60,
      feelsLike: expect.any(Number),
      cloudCover: 45,
      uv: 3
    }));
  });

  it('should handle API errors', async () => {
    // Mock failed fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden'
    });

    const result = await fetchWeatherData(mockLake);

    expect(result).toEqual({
      errorMessage: 'Weather API error: 403 Forbidden'
    });
  });

  it('should handle network errors', async () => {
    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await fetchWeatherData(mockLake);

    expect(result).toEqual({
      errorMessage: 'Network error'
    });
  });

  describe('calculateFeelsLike', () => {
    it('should calculate wind chill for cold temperatures', () => {
      const temperature = 5; // °C
      const windSpeed = 8; // m/s
      const humidity = 60; // %
      
      const result = calculateFeelsLike(temperature, windSpeed, humidity);
      
      // The result should be less than the actual temperature due to wind chill
      expect(result).toBeLessThan(temperature);
      expect(result).toBeCloseTo(3.1, 1); // Allows a tolerance of 0.1
    });

    it('should calculate heat index for warm temperatures with high humidity', () => {
      const temperature = 25; // °C
      const windSpeed = 2; // m/s
      const humidity = 70; // %
      
      const result = calculateFeelsLike(temperature, windSpeed, humidity);
      
      // The result should be greater than the actual temperature due to humidity
      expect(result).toBeGreaterThan(temperature);
      expect(result).toBeCloseTo(26.0, 1); // Allows a tolerance of 0.1
    });

    it('should return actual temperature for moderate conditions', () => {
      const temperature = 15; // °C
      const windSpeed = 3; // m/s
      const humidity = 30; // %
      
      const result = calculateFeelsLike(temperature, windSpeed, humidity);
      
      // For moderate temperatures, should return the same temperature
      expect(result).toBe(temperature);
    });
  });

  describe('getWeatherDescription', () => {
    it('should return the correct description for common weather symbols', () => {
      expect(getWeatherDescription('clearsky')).toBe('Klart');
      expect(getWeatherDescription('fair')).toBe('Uppehåll');
      expect(getWeatherDescription('partlycloudy')).toBe('Delvis moln');
      expect(getWeatherDescription('cloudy')).toBe('Molnigt');
      expect(getWeatherDescription('rain')).toBe('Regn');
      expect(getWeatherDescription('snow')).toBe('Snö');
    });

    it('should handle day/night variations of weather symbols', () => {
      // Day variation
      expect(getWeatherDescription('clearsky_day')).toBe('Klart');
      // Night variation
      expect(getWeatherDescription('clearsky_night')).toBe('Klart');
      // Polar variation
      expect(getWeatherDescription('clearsky_polartwilight')).toBe('Klart');
    });

    it('should handle complex weather symbols', () => {
      expect(getWeatherDescription('rainshowersandthunder')).toBe('Regnskurar och åska');
      expect(getWeatherDescription('heavyrainshowersandthunder')).toBe('Kraftiga regnskurar och åska');
    });

    it('should return "Okänd" for undefined or unknown weather symbols', () => {
      expect(getWeatherDescription(undefined)).toBe('Okänd');
      expect(getWeatherDescription('not_a_valid_symbol')).toBe('Okänd');
    });
  });
});