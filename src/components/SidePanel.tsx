import React, { useState } from 'react';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface SidePanelProps {
  selectedLake: GeoJsonFeature | null;
}

const SidePanel: React.FC<SidePanelProps> = ({ selectedLake }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [drivingDistance, setDrivingDistance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedLake) {
    return (
      <div className="side-panel">
        <p>Välj en sjö på kartan för att se mer information</p>
      </div>
    );
  }

  const renderCaughtSpecies = (species: string[] | string | undefined): string => {
    if (!species) return 'Inga rapporterade';
    if (Array.isArray(species)) return species.join(', ');
    return species;
  };

  const getUserLocation = () => {
    setIsLoading(true);
    setError(null);
    setDrivingDistance(null);

    if (!navigator.geolocation) {
      setError('Geolocation stöds inte av din webbläsare');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userPos);
        calculateDrivingDistance(userPos);
      },
      (err) => {
        setError(`Det gick inte att hämta din position: ${err.message}`);
        setIsLoading(false);
      }
    );
  };

  const calculateDrivingDistance = async (userPos: { lat: number; lng: number }) => {
    try {
      // Get lake coordinates (Leaflet uses [lat, lng] whereas GeoJSON uses [lng, lat])
      const lakePos = {
        lat: selectedLake.geometry.coordinates[1],
        lng: selectedLake.geometry.coordinates[0]
      };

      // Use OpenRouteService API to get driving directions
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248a1f4a9b4b0e04a6c9e1a31e0bd8fb866&start=${userPos.lng},${userPos.lat}&end=${lakePos.lng},${lakePos.lat}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const route = data.features[0];
        const distanceKm = (route.properties.summary.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.properties.summary.duration / 60);

        setDrivingDistance(`${distanceKm} km (ca ${durationMin} minuter)`);
      } else {
        setError('Kunde inte beräkna körsträcka');
      }
    } catch (err) {
      setError('Ett fel uppstod vid beräkning av körsträcka');
      console.error('Error calculating driving distance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="side-panel">
      <h2>{selectedLake.properties.name}</h2>
      <div className="lake-info">
        <p><strong>Maxdjup:</strong> {selectedLake.properties.maxDepth !== null ? `${selectedLake.properties.maxDepth} m` : 'Okänt'}</p>
        <p><strong>Area:</strong> {selectedLake.properties.area !== null && selectedLake.properties.area !== undefined
          ? `${selectedLake.properties.area.toLocaleString()} ha`
          : 'Okänd'}</p>
        <p><strong>Län:</strong> {selectedLake.properties.county}</p>
        <p><strong>Fångade arter:</strong> {renderCaughtSpecies(selectedLake.properties.catchedSpecies || selectedLake.properties.fångadeArter)}</p>
        <p><strong>Vanligaste art:</strong> {selectedLake.properties.vanlArt
          ? `${selectedLake.properties.vanlArt} (${selectedLake.properties.vanlArtWProc}%)`
          : 'Okänd'}</p>
        <p><strong>Näst vanligaste art:</strong> {selectedLake.properties.nästVanlArt
          ? `${selectedLake.properties.nästVanlArt} (${selectedLake.properties.nästVanlArtWProc}%)`
          : 'Okänd'}</p>
        <p><strong>Senaste fiskeår:</strong> {selectedLake.properties.senasteFiskeår || 'Okänt'}</p>
      </div>

      <div className="driving-directions">
        <h3>Körsträcka</h3>
        {drivingDistance ? (
          <p><strong>Avstånd från din position:</strong> {drivingDistance}</p>
        ) : (
          <button
            onClick={getUserLocation}
            disabled={isLoading}
            className="get-directions-btn"
          >
            {isLoading ? 'Beräknar...' : 'Beräkna körsträcka'}
          </button>
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default SidePanel;
