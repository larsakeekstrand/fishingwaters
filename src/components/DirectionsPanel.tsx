import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  CircularProgress, 
  Paper, 
  Divider,
  IconButton, 
  Switch,
  FormControlLabel,
  Collapse,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import DirectionsIcon from '@mui/icons-material/Directions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface DirectionsPanelProps {
  selectedLake: GeoJsonFeature;
}

const StyledDirectionsPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(3),
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const DirectionsPanel: React.FC<DirectionsPanelProps> = ({ selectedLake }) => {
  const [expanded, setExpanded] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extract latitude and longitude from the lake feature
  const lakeLatitude = selectedLake.geometry.coordinates[1];
  const lakeLongitude = selectedLake.geometry.coordinates[0];
  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const handleToggleUseCurrentLocation = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseCurrentLocation(event.target.checked);
    if (event.target.checked) {
      setStartLocation('');
    }
  };
  
  const handleGetDirections = () => {
    if (useCurrentLocation) {
      getCurrentLocation();
    } else if (startLocation) {
      openGoogleMapsWithAddress();
    } else {
      setError('Please enter a starting location or use your current location');
    }
  };
  
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          openGoogleMapsWithCoordinates(latitude, longitude);
          setLoading(false);
        },
        (err) => {
          console.error('Error getting current location:', err);
          setError('Failed to get your location. Please check browser permissions or enter an address manually.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please enter an address manually.');
      setLoading(false);
    }
  };
  
  const openGoogleMapsWithCoordinates = (startLat: number, startLng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${lakeLatitude},${lakeLongitude}&travelmode=driving`;
    window.open(url, '_blank');
  };
  
  const openGoogleMapsWithAddress = () => {
    const encodedAddress = encodeURIComponent(startLocation);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodedAddress}&destination=${lakeLatitude},${lakeLongitude}&travelmode=driving`;
    window.open(url, '_blank');
  };
  
  return (
    <StyledDirectionsPanel>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        onClick={handleToggleExpand}
        sx={{ cursor: 'pointer' }}
      >
        <Typography variant="subtitle1" color="primary" fontWeight="medium">
          Driving Directions
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Divider sx={{ my: 1.5 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <FormControlLabel
          control={
            <Switch 
              checked={useCurrentLocation} 
              onChange={handleToggleUseCurrentLocation}
              color="primary"
            />
          }
          label="Use my current location"
        />
        
        {!useCurrentLocation && (
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label="Enter your starting location"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            margin="normal"
            placeholder="Enter address, city or postal code"
            disabled={useCurrentLocation}
          />
        )}
        
        <Box display="flex" justifyContent="space-between" mt={2}>
          {useCurrentLocation && (
            <Button
              startIcon={<MyLocationIcon />}
              variant="outlined"
              size="small"
              color="primary"
              onClick={getCurrentLocation}
              disabled={loading}
            >
              Get My Location
            </Button>
          )}
          
          <Button
            startIcon={loading ? <CircularProgress size={20} /> : <DirectionsIcon />}
            variant="contained"
            color="primary"
            onClick={handleGetDirections}
            disabled={loading || (!useCurrentLocation && !startLocation)}
            fullWidth={!useCurrentLocation}
          >
            Get Directions
          </Button>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Directions will open in Google Maps.
        </Typography>
      </Collapse>
    </StyledDirectionsPanel>
  );
};

export default DirectionsPanel;