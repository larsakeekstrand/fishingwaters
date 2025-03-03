import { convertLakeDataToGeoJson, removeBOM, mergeGeoJsonCollections } from '../DataLoader';
import { GeoJsonCollection } from '../../types/GeoJsonTypes';

describe('DataLoader', () => {
  describe('convertLakeDataToGeoJson', () => {
    const sampleLakeData = [
      {
        län: 'Halland',
        sjö: 'Test Lake 1',
        lokal: 'Test Location 1',
        sweref99N: 6580822,
        sweref99E: 674032,
        maxDjup: 10.5,
        area: 100,
        höH: 50,
        fångadeArter: ['Gädda', 'Abborre']
      },
      {
        län: 'Skåne',
        sjö: 'Test Lake 2',
        lokal: 'Test Location 2',
        sweref99N: NaN, // Invalid coordinates
        sweref99E: 674032,
        maxDjup: null,
        area: 200,
        höH: 75,
        fångadeArter: 'Gädda'
      }
    ];

    it('should convert valid lake data to GeoJSON format', () => {
      const result = convertLakeDataToGeoJson([sampleLakeData[0]]);
      
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
      
      const feature = result.features[0];
      expect(feature.type).toBe('Feature');
      expect(feature.geometry.type).toBe('Point');
      expect(feature.geometry.coordinates).toHaveLength(2);
      
      expect(feature.properties).toMatchObject({
        name: 'Test Lake 1',
        county: 'Halland',
        location: 'Test Location 1',
        maxDepth: 10.5,
        area: 100,
        elevation: 50,
        catchedSpecies: ['Gädda', 'Abborre']
      });
    });

    it('should skip lakes with invalid coordinates', () => {
      const result = convertLakeDataToGeoJson(sampleLakeData);
      expect(result.features).toHaveLength(1);
      expect(result.features[0].properties.name).toBe('Test Lake 1');
    });

    it('should preserve original Swedish property names', () => {
      const result = convertLakeDataToGeoJson([sampleLakeData[0]]);
      const properties = result.features[0].properties;
      
      expect(properties.sjö).toBe('Test Lake 1');
      expect(properties.län).toBe('Halland');
      expect(properties.höH).toBe(50);
      expect(properties.fångadeArter).toEqual(['Gädda', 'Abborre']);
    });
  });

  describe('removeBOM', () => {
    it('should remove BOM from string if present', () => {
      const withBOM = '\uFEFFTest string';
      expect(removeBOM(withBOM)).toBe('Test string');
    });

    it('should not modify string without BOM', () => {
      const withoutBOM = 'Test string';
      expect(removeBOM(withoutBOM)).toBe('Test string');
    });

    it('should handle empty string', () => {
      expect(removeBOM('')).toBe('');
    });
  });

  describe('mergeGeoJsonCollections', () => {
    const collection1: GeoJsonCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [18.0579, 59.3293]
        },
        properties: {
          name: 'Lake 1',
          county: 'County 1',
          location: 'Location 1',
          maxDepth: 10,
          area: 100,
          elevation: 50
        }
      }]
    };

    const collection2: GeoJsonCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [17.0579, 58.3293]
        },
        properties: {
          name: 'Lake 2',
          county: 'County 2',
          location: 'Location 2',
          maxDepth: 20,
          area: 200,
          elevation: 75
        }
      }]
    };

    it('should merge multiple collections', () => {
      const result = mergeGeoJsonCollections([collection1, collection2]);
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(2);
      expect(result.features[0].properties.name).toBe('Lake 1');
      expect(result.features[1].properties.name).toBe('Lake 2');
    });

    it('should handle empty collections', () => {
      const emptyCollection: GeoJsonCollection = {
        type: 'FeatureCollection',
        features: []
      };
      const result = mergeGeoJsonCollections([collection1, emptyCollection]);
      expect(result.features).toHaveLength(1);
    });

    it('should handle collections with empty features array', () => {
      const collectionWithEmptyFeatures: GeoJsonCollection = {
        type: 'FeatureCollection',
        features: []
      };
      
      const result = mergeGeoJsonCollections([collection1, collectionWithEmptyFeatures]);
      expect(result.features).toHaveLength(1);
      expect(result.features[0].properties.name).toBe('Lake 1');
    });
  });
});