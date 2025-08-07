export interface BoatRampProperties {
  id: string;
  name: string;
  url: string;
}

export interface BoatRampFeature {
  type: 'Feature';
  properties: BoatRampProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface BoatRampCollection {
  type: 'FeatureCollection';
  features: BoatRampFeature[];
}