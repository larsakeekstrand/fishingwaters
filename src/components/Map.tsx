import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { GeoJsonCollection, GeoJsonFeature } from '../types/GeoJsonTypes';

interface MapProps {
  data: GeoJsonCollection;
  filteredSpecies: Set<string>;
}

const Map: React.FC<MapProps> = ({ data, filteredSpecies }) => {
  const swedenCenter: [number, number] = [62.0, 15.0];
  
  // Filter features based on selected species
  const getFilteredFeatures = (): GeoJsonFeature[] => {
    if (filteredSpecies.size === 0) {
      return data.features;
    }
    
    return data.features.filter(feature => {
      const hasAnySelectedSpecies = (featureSpecies: string[] | string | undefined) => {
        if (!featureSpecies) return false;
        
        if (Array.isArray(featureSpecies)) {
          return featureSpecies.some(s => filteredSpecies.has(s));
        } else if (typeof featureSpecies === 'string') {
          if (featureSpecies.includes(',')) {
            return featureSpecies.split(',').map(s => s.trim())
              .some(s => filteredSpecies.has(s));
          }
          return filteredSpecies.has(featureSpecies);
        }
        return false;
      };
      
      return hasAnySelectedSpecies(feature.properties.catchedSpecies) || 
             hasAnySelectedSpecies(feature.properties.fångadeArter);
    });
  };

  // Helper function to check if a lake has Gös among its caught species
  const hasGös = (feature: GeoJsonFeature): boolean => {
    const checkSpecies = (species: string[] | string | undefined) => {
      if (!species) return false;
      if (Array.isArray(species)) {
        return species.some(s => s.includes("Gös"));
      }
      return typeof species === 'string' && species.includes("Gös");
    };
    
    return checkSpecies(feature.properties.catchedSpecies) || 
           checkSpecies(feature.properties.fångadeArter);
  };

  // Format caught species for display in tooltip
  const renderCaughtSpecies = (feature: GeoJsonFeature): string => {
    const species = feature.properties.catchedSpecies || feature.properties.fångadeArter;
    
    if (!species) return 'Inga rapporterade';
    
    if (Array.isArray(species)) {
      return species.join(', ');
    }
    
    return typeof species === 'string' ? species : 'Inga rapporterade';
  };

  return (
    <MapContainer center={swedenCenter} zoom={5} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap bidragsgivare"
        maxZoom={19}
      />
      {getFilteredFeatures().map((feature, index) => {
        const { coordinates } = feature.geometry;
        // Leaflet uses [lat, lng] whereas GeoJSON uses [lng, lat]
        const position: [number, number] = [coordinates[1], coordinates[0]]; 
        
        // Determine color based on presence of "Gös"
        const fillColor = hasGös(feature) ? '#00bb00' : '#3388ff';
        
        return (
          <CircleMarker 
            key={index}
            center={position}
            radius={5}
            pathOptions={{
              fillColor,
              color: '#fff',
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            }}
          >
            <Tooltip sticky direction="top">
              <div className="lake-tooltip">
                <strong>{feature.properties.name}</strong><br />
                Maxdjup: {feature.properties.maxDepth !== null ? `${feature.properties.maxDepth} m` : 'Okänt'}<br />
                Area: {feature.properties.area !== null && feature.properties.area !== undefined 
                  ? `${feature.properties.area.toLocaleString()} ha` 
                  : 'Okänd'}<br />
                Län: {feature.properties.county}<br />
                Fångade arter: {renderCaughtSpecies(feature)}<br />
                Vanligaste art: {feature.properties.vanlArt || 'Okänd'}<br />
                Senaste fiskeår: {feature.properties.senasteFiskeår || 'Okänt'}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
};

export default Map;
