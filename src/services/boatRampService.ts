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

  async getBoatRampsInBounds(
    northEast: [number, number],
    southWest: [number, number]
  ): Promise<BoatRampFeature[]> {
    const allRamps = await this.loadBoatRamps();
    
    return allRamps.features.filter(ramp => {
      const [lng, lat] = ramp.geometry.coordinates;
      return (
        lat >= southWest[0] && lat <= northEast[0] &&
        lng >= southWest[1] && lng <= northEast[1]
      );
    });
  }

  async getNearbyBoatRamps(
    center: [number, number],
    radiusKm: number
  ): Promise<BoatRampFeature[]> {
    const allRamps = await this.loadBoatRamps();
    
    return allRamps.features.filter(ramp => {
      const distance = this.calculateDistance(
        center,
        [ramp.geometry.coordinates[1], ramp.geometry.coordinates[0]]
      );
      return distance <= radiusKm;
    });
  }

  private calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(coord2[0] - coord1[0]);
    const dLon = this.toRad(coord2[1] - coord1[1]);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(coord1[0])) * Math.cos(this.toRad(coord2[0])) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

const boatRampService = new BoatRampService();
export default boatRampService;