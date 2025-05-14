import { getWindDirection, getWeatherDescription } from '../weatherService';

describe('weatherService', () => {
  describe('getWindDirection', () => {
    it('should return correct cardinal direction for different degrees', () => {
      expect(getWindDirection(0)).toBe('N');
      expect(getWindDirection(45)).toBe('NE');
      expect(getWindDirection(90)).toBe('E');
      expect(getWindDirection(135)).toBe('SE');
      expect(getWindDirection(180)).toBe('S');
      expect(getWindDirection(225)).toBe('SW');
      expect(getWindDirection(270)).toBe('W');
      expect(getWindDirection(315)).toBe('NW');
      expect(getWindDirection(360)).toBe('N');
    });

    it('should handle edge cases for wind directions', () => {
      expect(getWindDirection(22)).toBe('N');
      expect(getWindDirection(68)).toBe('E'); // Between 67.5 and 112.5 degrees is E
      expect(getWindDirection(400)).toBe('NE'); // > 360 degrees (400 % 360 = 40, which is NE)
    });
  });

  describe('getWeatherDescription', () => {
    it('should return correct description for symbol codes', () => {
      expect(getWeatherDescription('clearsky')).toBe('Klart');
      expect(getWeatherDescription('partlycloudy')).toBe('Delvis molnigt');
      expect(getWeatherDescription('rain')).toBe('Regn');
    });

    it('should handle day/night variations', () => {
      expect(getWeatherDescription('clearsky_day')).toBe('Klart');
      expect(getWeatherDescription('partlycloudy_night')).toBe('Delvis molnigt');
    });

    it('should return "Okänt väder" for unknown symbol codes', () => {
      expect(getWeatherDescription('unknown_code')).toBe('Okänt väder');
      expect(getWeatherDescription('')).toBe('Okänt väder');
    });
  });
});