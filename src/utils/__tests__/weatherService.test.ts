// Import the functions directly (not the whole module which uses axios)
import { 
  mapSymbolToIcon, 
  getWeatherDescription 
} from '../weatherService';

// Mock axios - but we don't actually use it in these tests
jest.mock('axios', () => ({
  get: jest.fn()
}));

describe('weatherService', () => {
  describe('mapSymbolToIcon', () => {
    it('maps clearsky to WbSunny', () => {
      expect(mapSymbolToIcon('clearsky_day')).toBe('WbSunny');
      expect(mapSymbolToIcon('clearsky_night')).toBe('WbSunny');
      expect(mapSymbolToIcon('clearsky')).toBe('WbSunny');
    });
    
    it('maps fair to LightMode', () => {
      expect(mapSymbolToIcon('fair_day')).toBe('LightMode');
      expect(mapSymbolToIcon('fair_night')).toBe('LightMode');
    });
    
    it('maps cloudy to Cloud', () => {
      expect(mapSymbolToIcon('cloudy')).toBe('Cloud');
    });
    
    it('maps rain to WaterDrop', () => {
      expect(mapSymbolToIcon('rain')).toBe('WaterDrop');
      expect(mapSymbolToIcon('lightrain')).toBe('WaterDrop');
    });
    
    it('maps thunder to Thunderstorm', () => {
      expect(mapSymbolToIcon('heavyrainandthunder')).toBe('Thunderstorm');
      expect(mapSymbolToIcon('lightrainshowersandthunder')).toBe('Thunderstorm');
    });
    
    it('maps snow to Snowflake or AcUnit', () => {
      expect(mapSymbolToIcon('snow')).toBe('Snowflake');
      expect(mapSymbolToIcon('lightsnow')).toBe('Snowflake');
      expect(mapSymbolToIcon('sleet')).toBe('AcUnit');
    });
    
    it('provides a default icon for unknown symbols', () => {
      expect(mapSymbolToIcon('unknown_symbol')).toBe('WbSunny');
    });
    
    it('handles suffixes in symbol codes', () => {
      expect(mapSymbolToIcon('rain_day')).toBe('WaterDrop');
      expect(mapSymbolToIcon('rain_night')).toBe('WaterDrop');
      expect(mapSymbolToIcon('rain_polartwilight')).toBe('WaterDrop');
    });
  });
  
  describe('getWeatherDescription', () => {
    it('returns Swedish descriptions for various weather symbols', () => {
      expect(getWeatherDescription('clearsky_day')).toBe('Klart');
      expect(getWeatherDescription('fair_night')).toBe('Mestadels klart');
      expect(getWeatherDescription('partlycloudy')).toBe('Delvis molnigt');
      expect(getWeatherDescription('cloudy')).toBe('Molnigt');
      expect(getWeatherDescription('fog')).toBe('Dimma');
      expect(getWeatherDescription('rain')).toBe('Regn');
      expect(getWeatherDescription('lightrain')).toBe('Lätt regn');
      expect(getWeatherDescription('heavyrain')).toBe('Kraftigt regn');
      expect(getWeatherDescription('snow')).toBe('Snö');
      expect(getWeatherDescription('heavyrainandthunder')).toBe('Kraftigt regn med åska');
    });
    
    it('handles unknown weather symbols', () => {
      expect(getWeatherDescription('unknown_symbol')).toBe('Okänt väder');
    });
    
    it('ignores day/night suffixes', () => {
      expect(getWeatherDescription('clearsky_day')).toBe('Klart');
      expect(getWeatherDescription('clearsky_night')).toBe('Klart');
      expect(getWeatherDescription('clearsky_polartwilight')).toBe('Klart');
    });
  });
});