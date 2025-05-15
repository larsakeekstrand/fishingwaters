import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { styled } from '@mui/material/styles';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface DirectionsPanelProps {
  selectedLake: GeoJsonFeature;
}

const StyledDirectionsPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default
}));

const DirectionsPanel: React.FC<DirectionsPanelProps> = ({ selectedLake }) => {
  const [locationType, setLocationType] = useState<'current' | 'manual'>('current');
  const [manualAddress, setManualAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Google Maps destination coordinates from the lake
  const destinationCoords = selectedLake.geometry.coordinates;
  // Leaflet uses [lat, lng] whereas GeoJSON uses [lng, lat]
  const lakeLatitude = destinationCoords[1];
  const lakeLongitude = destinationCoords[0];
  
  const handleLocationTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocationType(event.target.value as 'current' | 'manual');
    setError(null);
  };
  
  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManualAddress(event.target.value);
    setError(null);
  };
  
  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
  };
  
  const handleGetDirections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let directionsUrl = '';
      
      if (locationType === 'current') {
        try {
          const position = await getCurrentLocation();
          const { latitude, longitude } = position.coords;
          directionsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${lakeLatitude},${lakeLongitude}`;
        } catch (err) {
          throw new Error('Kunde inte hämta din position. Kontrollera att du har gett behörighet för att dela din plats.');
        }
      } else {
        if (!manualAddress.trim()) {
          throw new Error('Vänligen ange en adress för att få vägbeskrivningar');
        }
        // Use the address for directions
        directionsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(manualAddress)}/${lakeLatitude},${lakeLongitude}`;
      }
      
      // Open Google Maps in a new tab
      window.open(directionsUrl, '_blank');
    } catch (err: any) {
      setError(err.message || 'Ett fel uppstod när vägbeskrivningar skulle hämtas');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <StyledDirectionsPanel elevation={1}>
      <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="medium">
        Vägbeskrivning
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Startplats</FormLabel>
        <RadioGroup
          value={locationType}
          onChange={handleLocationTypeChange}
          row
        >
          <FormControlLabel 
            value="current" 
            control={<Radio size="small" />} 
            label={
              <Box display="flex" alignItems="center">
                <MyLocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">Min position</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="manual" 
            control={<Radio size="small" />} 
            label={
              <Typography variant="body2">Ange adress</Typography>
            }
          />
        </RadioGroup>
      </FormControl>
      
      {locationType === 'manual' && (
        <TextField
          fullWidth
          size="small"
          label="Adress"
          variant="outlined"
          value={manualAddress}
          onChange={handleAddressChange}
          placeholder="Ange startadress"
          margin="normal"
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
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DirectionsIcon />}
        onClick={handleGetDirections}
        disabled={loading || (locationType === 'manual' && !manualAddress.trim())}
      >
        {loading ? 'Hämtar...' : 'Visa vägbeskrivning'}
      </Button>
    </StyledDirectionsPanel>
  );
};

export default DirectionsPanel;