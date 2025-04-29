import React, { useState } from 'react';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MyLocationIcon from '@mui/icons-material/MyLocation';

interface SidePanelProps {
  selectedLake: GeoJsonFeature | null;
}

const StyledSidePanel = styled(Paper)(({ theme }) => ({
  width: 300,
  padding: theme.spacing(3),
  height: '100vh',
  overflow: 'auto',
  boxShadow: theme.shadows[3],
  zIndex: 1000,
  position: 'relative'
}));

const SidePanel: React.FC<SidePanelProps> = ({ selectedLake }) => {
  const [location, setLocation] = useState<string>('');
  
  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
  };
  
  const getDirectionsUrl = (startLocation: string, endCoordinates: [number, number]) => {
    // Google Maps uses lat,lng format but our coordinates are in [lng, lat] format
    const [lng, lat] = endCoordinates;
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${lat},${lng}&travelmode=driving`;
  };
  
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude},${longitude}`);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  if (!selectedLake) {
    return (
      <StyledSidePanel>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body1" color="text.secondary">
            Välj en sjö på kartan för att se mer information
          </Typography>
        </Box>
      </StyledSidePanel>
    );
  }

  const renderCaughtSpecies = (species: string[] | string | undefined): string => {
    if (!species) return 'Inga rapporterade';
    if (Array.isArray(species)) return species.join(', ');
    return species;
  };

  return (
    <StyledSidePanel>
      <Typography variant="h5" component="h2" gutterBottom color="primary">
        {selectedLake.properties.name}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List disablePadding>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Maxdjup" 
            secondary={selectedLake.properties.maxDepth !== null ? `${selectedLake.properties.maxDepth} m` : 'Okänt'} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Area" 
            secondary={selectedLake.properties.area !== null && selectedLake.properties.area !== undefined
              ? `${selectedLake.properties.area.toLocaleString()} ha`
              : 'Okänd'} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Län" 
            secondary={selectedLake.properties.county} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Fångade arter" 
            secondary={renderCaughtSpecies(selectedLake.properties.catchedSpecies || selectedLake.properties.fångadeArter)} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Vanligaste art" 
            secondary={selectedLake.properties.vanlArt
              ? `${selectedLake.properties.vanlArt} (${selectedLake.properties.vanlArtWProc}%)`
              : 'Okänd'} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Näst vanligaste art" 
            secondary={selectedLake.properties.nästVanlArt
              ? `${selectedLake.properties.nästVanlArt} (${selectedLake.properties.nästVanlArtWProc}%)`
              : 'Okänd'} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Senaste fiskeår" 
            secondary={selectedLake.properties.senasteFiskeår || 'Okänt'} 
          />
        </ListItem>
      </List>
      
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Vägbeskrivning
      </Typography>
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Min position"
          variant="outlined"
          value={location}
          onChange={handleLocationChange}
          placeholder="Ange adress eller koordinater"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={getUserLocation}
                  edge="end"
                  title="Använd min nuvarande plats"
                >
                  <MyLocationIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
        <Button 
          variant="contained" 
          fullWidth
          color="primary"
          href={location ? getDirectionsUrl(location, selectedLake.geometry.coordinates) : '#'}
          target="_blank"
          rel="noopener noreferrer"
          disabled={!location}
          sx={{ mt: 1 }}
        >
          Visa vägbeskrivning
        </Button>
      </Box>
    </StyledSidePanel>
  );
};

export default SidePanel;
