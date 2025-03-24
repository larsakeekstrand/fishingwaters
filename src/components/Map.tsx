import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { GeoJsonCollection, GeoJsonFeature } from '../types/GeoJsonTypes';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import RoutingMachine from './RoutingMachine';

interface MapProps {
  data: GeoJsonCollection;
  filteredSpecies: Set<string>;
  onLakeSelect: (lake: GeoJsonFeature) => void;
}

// Component to handle geocoding
const GeocodingControl = ({
  startLocation,
  endLocation,
  onRouteFound
}: {
  startLocation: string | null,
  endLocation: [number, number] | null,
  onRouteFound: (start: L.LatLng | null, end: L.LatLng | null) => void
}) => {
  const map = useMap();

  useEffect(() => {
    if (!startLocation || !endLocation) {
      onRouteFound(null, null);
      return;
    }

    // Convert the end location to a LatLng object
    const endLatLng = L.latLng(endLocation[0], endLocation[1]);

    // Use OpenStreetMap Nominatim for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startLocation)}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const startLatLng = L.latLng(parseFloat(lat), parseFloat(lon));

          // Call the callback with the geocoded points
          onRouteFound(startLatLng, endLatLng);

          // Fit the map to include both points
          const bounds = L.latLngBounds([startLatLng, endLatLng]);
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          console.error('Location not found');
          onRouteFound(null, null);
        }
      })
      .catch(error => {
        console.error('Error geocoding location:', error);
        onRouteFound(null, null);
      });
  }, [startLocation, endLocation, map, onRouteFound]);

  return null;
};

const Map = React.forwardRef<{ handleGetDirections: (startLocation: string, endLocation: [number, number]) => void }, MapProps>(
  ({ data, filteredSpecies, onLakeSelect }, ref) => {
  const swedenCenter: [number, number] = [62.0, 15.0];
  const [routeStart, setRouteStart] = useState<string | null>(null);
  const [routeEnd, setRouteEnd] = useState<[number, number] | null>(null);
  const [startPoint, setStartPoint] = useState<L.LatLng | null>(null);
  const [endPoint, setEndPoint] = useState<L.LatLng | null>(null);

  // Expose the handleGetDirections method via ref
  React.useImperativeHandle(ref, () => ({
    handleGetDirections
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

  // Handle getting directions
  const handleGetDirections = (startLocation: string, endLocation: [number, number]) => {
    setRouteStart(startLocation);
    setRouteEnd(endLocation);
  };

  // Handle route points found
  const handleRouteFound = (start: L.LatLng | null, end: L.LatLng | null) => {
    setStartPoint(start);
    setEndPoint(end);
  };

  return (
    <MapContainer center={swedenCenter} zoom={5} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap bidragsgivare"
        maxZoom={19}
      />

      {/* Geocoding control */}
      <GeocodingControl
        startLocation={routeStart}
        endLocation={routeEnd}
        onRouteFound={handleRouteFound}
      />

      {/* Routing machine */}
      {startPoint && endPoint && (
        <RoutingMachine startPoint={startPoint} endPoint={endPoint} />
      )}

      {getFilteredFeatures().map((feature, index) => {
        const { coordinates } = feature.geometry;
        // Leaflet uses [lat, lng] whereas GeoJSON uses [lng, lat]
        const position: [number, number] = [coordinates[1], coordinates[0]]; 
        
        const fillColor = '#3388ff';
        
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
            eventHandlers={{
              click: () => {
                onLakeSelect(feature);
                // Clear any existing routes when selecting a new lake
                setRouteStart(null);
                setRouteEnd(null);
                setStartPoint(null);
                setEndPoint(null);
              }
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
};

export default Map;
