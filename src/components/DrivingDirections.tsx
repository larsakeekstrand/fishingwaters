import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Divider, 
  Card, 
  CardContent,
  Link,
  InputAdornment
} from '@mui/material';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import MyLocationIcon from '@mui/icons-material/MyLocation';

interface DrivingDirectionsProps {
  selectedLake: GeoJsonFeature;
}

const DrivingDirections: React.FC<DrivingDirectionsProps> = ({ selectedLake }) => {
  const [startLocation, setStartLocation] = useState<string>('');
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get coordinates of the selected lake
  const getLakeCoordinates = (): string => {
    // Remember GeoJSON coordinates are [longitude, latitude]
    const [longitude, latitude] = selectedLake.geometry.coordinates;
    return `${latitude},${longitude}`;
  };

  // Handle getting the user's current location
  const handleGetCurrentLocation = () => {
    setError(null);
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setStartLocation(`${latitude},${longitude}`);
          setUseCurrentLocation(true);
          setLoading(false);
        },
        (error) => {
          // Only log errors in non-test environments
          if (process.env.NODE_ENV !== 'test') {
            console.error('Error getting current location:', error);
          }
          setError('Det gick inte att hämta din position. Vänligen ange platsen manuellt.');
          setLoading(false);
          setUseCurrentLocation(false);
        }
      );
    } else {
      setError('Platstjänster stöds inte i din webbläsare.');
      setLoading(false);
      setUseCurrentLocation(false);
    }
  };

  // Build the Google Maps directions URL
  const buildDirectionsUrl = (): string => {
    const destination = getLakeCoordinates();
    const origin = encodeURIComponent(startLocation);
    
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          Vägbeskrivning
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Startplats"
            variant="outlined"
            size="small"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            placeholder={useCurrentLocation ? "Din nuvarande position" : "Ange adress eller plats"}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <Button 
            startIcon={<MyLocationIcon />}
            onClick={handleGetCurrentLocation} 
            disabled={loading}
            size="small"
            variant="text"
            color="primary"
            sx={{ mt: 1 }}
          >
            {loading ? 'Hämtar position...' : 'Använd min position'}
          </Button>
          
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" gutterBottom>
            Destination: <strong>{selectedLake.properties.name}</strong>
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<DirectionsIcon />}
          disabled={!startLocation}
          component={Link}
          href={startLocation ? buildDirectionsUrl() : '#'}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visa vägbeskrivning
        </Button>
      </CardContent>
    </Card>
  );
};

export default DrivingDirections;