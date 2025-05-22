import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface DrivingDirectionsProps {
  selectedLake: GeoJsonFeature;
}

const DirectionsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const DrivingDirections: React.FC<DrivingDirectionsProps> = ({ selectedLake }) => {
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(true);
  const [customAddress, setCustomAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetDirections = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const lakeCoords = selectedLake.geometry.coordinates;
      const destination = `${lakeCoords[1]},${lakeCoords[0]}`; // lat,lng for Google Maps

      let origin = '';

      if (useCurrentLocation) {
        // Get user's current location
        if (!navigator.geolocation) {
          throw new Error('Geolocation stöds inte av din webbläsare');
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        });

        origin = `${position.coords.latitude},${position.coords.longitude}`;
      } else {
        if (!customAddress.trim()) {
          throw new Error('Vänligen ange en startadress');
        }
        origin = encodeURIComponent(customAddress.trim());
      }

      // Create Google Maps URL for directions
      const googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
      
      // Open in new tab
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');

    } catch (err: any) {
      if (err && typeof err.code === 'number') {
        // Geolocation error
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            setError('Åtkomst till din position nekades. Använd istället en adress.');
            break;
          case 2: // POSITION_UNAVAILABLE
            setError('Din position kunde inte bestämmas. Använd istället en adress.');
            break;
          case 3: // TIMEOUT
            setError('Tidsgränsen för att hämta din position överskreds. Använd istället en adress.');
            break;
          default:
            setError('Ett fel uppstod när din position skulle hämtas. Använd istället en adress.');
            break;
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ett oväntat fel uppstod');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseCurrentLocation(event.target.checked);
    setError(null);
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAddress(event.target.value);
    setError(null);
  };

  return (
    <DirectionsContainer>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <DirectionsCarIcon color="primary" />
        <Typography variant="h6" color="primary">
          Vägbeskrivning
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Få vägbeskrivning till {selectedLake.properties.name}
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={useCurrentLocation}
            onChange={handleSwitchChange}
            color="primary"
          />
        }
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <MyLocationIcon fontSize="small" />
            <Typography variant="body2">
              Använd min nuvarande position
            </Typography>
          </Box>
        }
        sx={{ mb: 2 }}
      />

      {!useCurrentLocation && (
        <TextField
          fullWidth
          size="small"
          placeholder="Ange startadress..."
          value={customAddress}
          onChange={handleAddressChange}
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleGetDirections}
        disabled={isLoading || (!useCurrentLocation && !customAddress.trim())}
        startIcon={isLoading ? <CircularProgress size={16} /> : <DirectionsCarIcon />}
      >
        {isLoading ? 'Hämtar vägbeskrivning...' : 'Visa vägbeskrivning'}
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Öppnas i Google Maps
      </Typography>
    </DirectionsContainer>
  );
};

export default DrivingDirections;