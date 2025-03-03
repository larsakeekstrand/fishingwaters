import { swerefToWgs84, isValidSwerefCoordinates } from '../coordinateConverter';

describe('coordinateConverter', () => {
  describe('swerefToWgs84', () => {
    it('should correctly convert SWEREF99 coordinates to WGS84', () => {
      // Test with known coordinate pair
      // Stockholm Central Station coordinates
      const result = swerefToWgs84(6580822, 674032);
      
      // Expected WGS84 coordinates (approximately)
      expect(result[0]).toBeCloseTo(18.0592, 3); // longitude, less strict precision
      expect(result[1]).toBeCloseTo(59.3302, 3); // latitude, less strict precision
    });

    it('should return coordinates in [longitude, latitude] format', () => {
      const result = swerefToWgs84(6580822, 674032);
      expect(result).toHaveLength(2);
      expect(typeof result[0]).toBe('number'); // longitude
      expect(typeof result[1]).toBe('number'); // latitude
    });
  });

  describe('isValidSwerefCoordinates', () => {
    it('should return true for valid coordinates', () => {
      expect(isValidSwerefCoordinates(6580822, 674032)).toBe(true);
    });

    it('should return false for null values', () => {
      expect(isValidSwerefCoordinates(null, 674032)).toBe(false);
      expect(isValidSwerefCoordinates(6580822, null)).toBe(false);
      expect(isValidSwerefCoordinates(null, null)).toBe(false);
    });

    it('should return false for undefined values', () => {
      expect(isValidSwerefCoordinates(undefined, 674032)).toBe(false);
      expect(isValidSwerefCoordinates(6580822, undefined)).toBe(false);
      expect(isValidSwerefCoordinates(undefined, undefined)).toBe(false);
    });

    it('should return false for NaN values', () => {
      expect(isValidSwerefCoordinates(NaN, 674032)).toBe(false);
      expect(isValidSwerefCoordinates(6580822, NaN)).toBe(false);
      expect(isValidSwerefCoordinates(NaN, NaN)).toBe(false);
    });
  });
});