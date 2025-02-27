import React, { useEffect, useState } from 'react';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface SpeciesFilterProps {
  features: GeoJsonFeature[];
  onFilterChange: (selectedSpecies: Set<string>) => void;
}

const SpeciesFilter: React.FC<SpeciesFilterProps> = ({ features, onFilterChange }) => {
  const [uniqueSpecies, setUniqueSpecies] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Set<string>>(new Set());

  useEffect(() => {
    const speciesSet = new Set<string>();
    
    features.forEach(feature => {
      const species = feature.properties.catchedSpecies || feature.properties.fångadeArter;
      
      if (species) {
        if (Array.isArray(species)) {
          species.forEach(s => speciesSet.add(s));
        } else if (typeof species === 'string') {
          if (species.includes(',')) {
            species.split(',').map(s => s.trim()).forEach(s => speciesSet.add(s));
          } else {
            speciesSet.add(species);
          }
        }
      }
    });
    
    setUniqueSpecies(Array.from(speciesSet).sort());
  }, [features]);

  const handleCheckboxChange = (species: string, checked: boolean) => {
    const newSelectedSpecies = new Set(selectedSpecies);
    
    if (checked) {
      newSelectedSpecies.add(species);
    } else {
      newSelectedSpecies.delete(species);
    }
    
    setSelectedSpecies(newSelectedSpecies);
    onFilterChange(newSelectedSpecies);
  };

  const handleSelectAll = () => {
    const allSpecies = new Set(uniqueSpecies);
    setSelectedSpecies(allSpecies);
    onFilterChange(allSpecies);
  };

  const handleClearAll = () => {
    setSelectedSpecies(new Set());
    onFilterChange(new Set());
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">Filtrera efter arter</div>
      <div className="filter-buttons">
        <button onClick={handleSelectAll}>Välj alla</button>
        <button onClick={handleClearAll}>Rensa alla</button>
      </div>
      <div className="species-list">
        {uniqueSpecies.map(species => (
          <div key={species} className="checkbox-item">
            <input
              type="checkbox"
              id={`species-${species.replace(/\s+/g, '-')}`}
              checked={selectedSpecies.has(species)}
              onChange={(e) => handleCheckboxChange(species, e.target.checked)}
            />
            <label htmlFor={`species-${species.replace(/\s+/g, '-')}`}>
              {species}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeciesFilter;
