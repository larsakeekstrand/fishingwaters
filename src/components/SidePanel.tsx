import React from 'react';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface SidePanelProps {
  selectedLake: GeoJsonFeature | null;
}

const SidePanel: React.FC<SidePanelProps> = ({ selectedLake }) => {
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
    </div>
  );
};

export default SidePanel;
