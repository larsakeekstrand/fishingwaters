export interface GeoJsonFeature {
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
    fångadeArter?: string[] | string;
    senasteFiskeår?: number;
    [key: string]: any; // Allow for additional properties
  };
}

export interface GeoJsonCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}
