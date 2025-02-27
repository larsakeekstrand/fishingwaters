import fs from 'fs';
import path from 'path';
import { swerefToWgs84, isValidSwerefCoordinates } from '../utils/coordinateConverter';

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

interface GeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    name: string;
    county: string;
    location: string;
    maxDepth: number | null;
    area: number;
    elevation: number;
    catchedSpecies?: string[] | string;
    [key: string]: any; // Allow for additional properties
  };
}

interface GeoJsonCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

/**
 * Removes Byte Order Mark (BOM) from a string if present
 * @param content File content that might contain a BOM
 * @returns String with BOM removed
 */
const removeBOM = (content: string): string => {
  // Remove UTF-8 BOM if present (EF BB BF or \uFEFF)
  if (content.charCodeAt(0) === 0xFEFF) {
    return content.slice(1);
  }
  return content;
};

/**
 * Loads lake data from all JSON files in the data directory
 * and converts SWEREF99 coordinates to WGS84 for GeoJSON
 */
export const loadLakeData = (): GeoJsonCollection => {
  const dataDir = path.join(__dirname, '../../data');
  const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
  
  const geoJsonFeatures: GeoJsonFeature[] = [];
  
  files.forEach(file => {
    try {
      const filePath = path.join(dataDir, file);
      let fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Remove BOM if present
      fileContent = removeBOM(fileContent);
      
      const lakes: LakeData[] = JSON.parse(fileContent);
      
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
          // This ensures all fields from the source data are available
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
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  });
  
  return {
    type: 'FeatureCollection',
    features: geoJsonFeatures
  };
};
