import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { Map as LeafletMap } from 'leaflet';
import { GeoJsonCollection, GeoJsonFeature } from '../types/GeoJsonTypes';

interface MapProps {
  data: GeoJsonCollection;
  filteredSpecies: Set<string>;
  selectedLake: GeoJsonFeature | null;
  onLakeSelect: (lake: GeoJsonFeature) => void;
}

export interface MapRef {
  focusOnLake: (lake: GeoJsonFeature) => void;
}

const Map = forwardRef<MapRef, MapProps>(({ data, filteredSpecies, selectedLake, onLakeSelect }, ref) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const swedenCenter: [number, number] = [62.0, 15.0];
  
  useImperativeHandle(ref, () => ({
    focusOnLake: (lake: GeoJsonFeature) => {
      if (mapRef.current) {
        const [lng, lat] = lake.geometry.coordinates;
        mapRef.current.setView([lat, lng], 10, {
          animate: true,
          duration: 1
        });
      }
    }
  }));
  
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
    <MapContainer 
      center={swedenCenter} 
      zoom={5} 
      style={{ height: '100vh', width: '100%' }}
      touchZoom={true}
      doubleClickZoom={true}
      scrollWheelZoom={true}
      zoomControl={true}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap bidragsgivare"
        maxZoom={19}
      />
      {getFilteredFeatures().map((feature, index) => {
        const { coordinates } = feature.geometry;
        // Leaflet uses [lat, lng] whereas GeoJSON uses [lng, lat]
        const position: [number, number] = [coordinates[1], coordinates[0]]; 
        
        // Green for selected lake, red for filtered, blue for normal
        const isSelected = selectedLake && 
          selectedLake.geometry.coordinates[0] === feature.geometry.coordinates[0] && 
          selectedLake.geometry.coordinates[1] === feature.geometry.coordinates[1];
        
        const fillColor = isSelected ? '#00ff00' : (filteredSpecies.size > 0 ? '#ff0000' : '#3388ff');
        
        return (
          <CircleMarker 
            key={index}
            center={position}
            radius={isSelected ? 10 : 8}
            pathOptions={{
              fillColor,
              color: isSelected ? '#00cc00' : '#fff',
              weight: isSelected ? 3 : 2,
              opacity: 1,
              fillOpacity: isSelected ? 1 : 0.8
            }}
            eventHandlers={{
              click: () => onLakeSelect(feature)
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
                Vanligaste art: {feature.properties.vanlArt ? `${feature.properties.vanlArt} (${feature.properties.vanlArtWProc}%)` : 'Okänd'}<br />
                Näst vanligaste art: {feature.properties.nästVanlArt ? `${feature.properties.nästVanlArt} (${feature.properties.nästVanlArtWProc}%)` : 'Okänd'}<br />
                Senaste fiskeår: {feature.properties.senasteFiskeår || 'Okänt'}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
});

Map.displayName = 'Map';

export default Map;
