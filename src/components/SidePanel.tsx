import React from 'react';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Box,
  Button
} from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import { styled } from '@mui/material/styles';

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
  
  // Generate Google Maps directions URL
  const getDirectionsUrl = (): string => {
    const { coordinates } = selectedLake.geometry;
    // GeoJSON uses [longitude, latitude] format, but Google Maps uses latitude,longitude
    const [longitude, latitude] = coordinates;
    const destination = `${latitude},${longitude}`;
    const lakeName = encodeURIComponent(selectedLake.properties.name);
    
    // Create URL with destination coordinates and lake name as a parameter
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${lakeName}`;
  };
  
  // Open Google Maps in a new tab
  const openDirections = () => {
    window.open(getDirectionsUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <StyledSidePanel>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h5" component="h2" color="primary">
          {selectedLake.properties.name}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<DirectionsIcon />}
          onClick={openDirections}
          title="Öppna vägbeskrivning i Google Maps"
        >
          Vägbeskrivning
        </Button>
      </Box>
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
    </StyledSidePanel>
  );
};

export default SidePanel;
