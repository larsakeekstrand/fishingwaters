import { setWorldConstructor } from '@cucumber/cucumber';

export interface CustomWorld {
  testData: {
    mockGeoJsonData?: any;
    mockIndexData?: any;
    selectedSpecies?: string[];
    mapOpened?: boolean;
  };
}

function FishingWatersWorld() {
  return {
    testData: {
      mockGeoJsonData: undefined,
      mockIndexData: undefined,
      selectedSpecies: [],
      mapOpened: false
    }
  };
}

setWorldConstructor(FishingWatersWorld);