import { weatherCodeToDescription } from '../weatherService';

describe('weatherService', () => {
  describe('weatherCodeToDescription', () => {
    it('should return the correct weather description for a given code', () => {
      expect(weatherCodeToDescription(0)).toBe('Klar himmel');
      expect(weatherCodeToDescription(61)).toBe('Lätt regn');
      expect(weatherCodeToDescription(95)).toBe('Åskväder');
    });

    it('should return "Okänt väder" for unknown weather codes', () => {
      expect(weatherCodeToDescription(999)).toBe('Okänt väder');
    });
  });
});