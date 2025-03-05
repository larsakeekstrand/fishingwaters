import React, { useState } from 'react';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface SidePanelProps {
  selectedLake: GeoJsonFeature | null;
}

const SidePanel: React.FC<SidePanelProps> = ({ selectedLake }) => {
  const [startLocation, setStartLocation] = useState<string>('');

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

  const getDirectionsUrl = () => {
    if (!selectedLake || !startLocation.trim()) return '';

    const { coordinates } = selectedLake.geometry;
    const destination = `${coordinates[1]},${coordinates[0]}`; // [lat, lng] for Google Maps
    const encodedStart = encodeURIComponent(startLocation);
    const encodedDestination = encodeURIComponent(destination);
    const encodedLakeName = encodeURIComponent(selectedLake.properties.name);

    return `https://www.google.com/maps/dir/?api=1&origin=${encodedStart}&destination=${encodedDestination}&destination_place_id=${encodedLakeName}`;
  };

  const handleGetDirections = (e: React.FormEvent) => {
    e.preventDefault();
    if (startLocation.trim()) {
      window.open(getDirectionsUrl(), '_blank');
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

      <div className="directions-container">
        <h3>Vägbeskrivning</h3>
        <form onSubmit={handleGetDirections}>
          <div className="directions-input">
            <label htmlFor="start-location">Din plats:</label>
            <input
              id="start-location"
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="Ange din startplats"
              required
            />
          </div>
          <button
            type="submit"
            className="directions-button"
            disabled={!startLocation.trim()}
          >
            Hämta vägbeskrivning
          </button>
        </form>
      </div>
    </div>
  );
};

export default SidePanel;
