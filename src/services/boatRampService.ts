import { BoatRampCollection, BoatRampFeature } from '../types/BoatRampTypes';

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '') || '/fishingwaters';

class BoatRampService {
  private boatRampsCache: BoatRampCollection | null = null;

  async loadBoatRamps(): Promise<BoatRampCollection> {
    if (this.boatRampsCache) {
      return this.boatRampsCache;
    }

    try {
      const response = await fetch(`${BASE_PATH}/data/boatramps.json`);
      if (!response.ok) {
        throw new Error(`Failed to load boat ramps: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.boatRampsCache = data;
      return data;
    } catch (error) {
      console.error('Error loading boat ramps:', error);
      return {
        type: 'FeatureCollection',
        features: []
      };
    }
  }

}

const boatRampService = new BoatRampService();
export default boatRampService;