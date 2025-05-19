import React from 'react';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WeatherPanel from './WeatherPanel';

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
      
      {/* Add Weather Panel */}
      <WeatherPanel selectedLake={selectedLake} />
    </StyledSidePanel>
  );
};

export default SidePanel;
