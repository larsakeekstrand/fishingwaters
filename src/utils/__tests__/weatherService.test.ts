import {
  getWeatherIcon,
  formatTime,
  formatDate,
} from '../weatherService';

describe('weatherService', () => {
  describe('getWeatherIcon', () => {
    it('returns correct icons for common weather symbols', () => {
      expect(getWeatherIcon('clearsky_day')).toBe('☀️');
      expect(getWeatherIcon('clearsky_night')).toBe('🌙');
      expect(getWeatherIcon('partlycloudy_day')).toBe('⛅');
      expect(getWeatherIcon('cloudy')).toBe('☁️');
      expect(getWeatherIcon('rain')).toBe('🌧️');
      expect(getWeatherIcon('snow')).toBe('❄️');
    });

    it('returns unknown icon for unrecognized symbols', () => {
      expect(getWeatherIcon('invalid_symbol')).toBe('❓');
      expect(getWeatherIcon('')).toBe('❓');
    });

    it('handles symbol codes with intensity suffixes', () => {
      expect(getWeatherIcon('rain_light')).toBe('🌧️');
      expect(getWeatherIcon('snow_heavy')).toBe('❄️');
    });
  });

  describe('formatTime', () => {
    it('formats time correctly in Swedish locale', () => {
      const timeString = '2023-12-25T14:30:00Z';
      const formatted = formatTime(timeString);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatDate', () => {
    it('formats date correctly in Swedish locale', () => {
      const timeString = '2023-12-25T14:30:00Z';
      const formatted = formatDate(timeString);
      expect(formatted).toContain('dec');
      expect(formatted).toContain('25');
    });
  });
});