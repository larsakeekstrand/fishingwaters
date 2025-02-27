import { GeoJsonCollection, GeoJsonFeature } from '../types/GeoJsonTypes';
import { swerefToWgs84, isValidSwerefCoordinates } from './coordinateConverter';

interface LakeData {
  län: string;
  sjö: string;
  lokal: string;
  sweref99N: number;
  sweref99E: number;
  maxDjup: number | null;
  area: number;
  höH: number;
  fångadeArter?: string[] | string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Convert raw lake data to GeoJSON format
 * This is a utility that can be used if you need to convert SWEREF99 coordinates
 * from your raw data files into GeoJSON
 */
export const convertLakeDataToGeoJson = (lakes: LakeData[]): GeoJsonCollection => {
  const geoJsonFeatures: GeoJsonFeature[] = [];
  
  lakes.forEach(lake => {
    if (isValidSwerefCoordinates(lake.sweref99N, lake.sweref99E)) {
      // Convert SWEREF99 coordinates to WGS84
      const coordinates = swerefToWgs84(lake.sweref99N, lake.sweref99E);
      
      // Create properties object with standard mappings
      const properties: any = {
        name: lake.sjö,
        county: lake.län,
        location: lake.lokal,
        maxDepth: lake.maxDjup,
        area: lake.area,
        elevation: lake.höH,
        catchedSpecies: lake.fångadeArter
      };
      
      // Add all original properties from the lake data
      Object.keys(lake).forEach(key => {
        // Use original property names (in Swedish) as well
        properties[key] = lake[key];
      });
      
      // Create GeoJSON feature
      const feature: GeoJsonFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        properties: properties
      };
      
      geoJsonFeatures.push(feature);
    }
  });
  
  return {
    type: 'FeatureCollection',
    features: geoJsonFeatures
  };
};

/**
 * Removes Byte Order Mark (BOM) from a string if present
 * @param content String that might contain a BOM
 * @returns String with BOM removed
 */
export const removeBOM = (content: string): string => {
  // Remove UTF-8 BOM if present (EF BB BF or \uFEFF)
  if (content.charCodeAt(0) === 0xFEFF) {
    return content.slice(1);
  }
  return content;
};

/**
 * Merges multiple GeoJSON collections into one
 * @param collections Array of GeoJSON collections
 * @returns Single merged GeoJSON collection
 */
export const mergeGeoJsonCollections = (collections: GeoJsonCollection[]): GeoJsonCollection => {
  const allFeatures: GeoJsonFeature[] = [];
  
  collections.forEach(collection => {
    if (collection && collection.features && Array.isArray(collection.features)) {
      allFeatures.push(...collection.features);
    }
  });
  
  return {
    type: 'FeatureCollection',
    features: allFeatures
  };
};
