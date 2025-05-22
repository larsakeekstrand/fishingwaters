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
import LakeSearch from './LakeSearch';

interface SidePanelProps {
  selectedLake: GeoJsonFeature | null;
  features: GeoJsonFeature[];
  onLakeSelect: (lake: GeoJsonFeature) => void;
  onMapRefocus: (coordinates: [number, number]) => void;
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

const SidePanel: React.FC<SidePanelProps> = ({ selectedLake, features, onLakeSelect, onMapRefocus }) => {
  const renderCaughtSpecies = (species: string[] | string | undefined): string => {
    if (!species) return 'Inga rapporterade';
    if (Array.isArray(species)) return species.join(', ');
    return species;
  };

  return (
    <StyledSidePanel>
      <LakeSearch 
        features={features}
        onLakeSelect={onLakeSelect}
        onMapRefocus={onMapRefocus}
      />
      
      {!selectedLake ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60%">
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Sök efter en sjö ovan eller välj en sjö på kartan för att se mer information
          </Typography>
        </Box>
      ) : (
        <>
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
        </>
      )}
    </StyledSidePanel>
  );
};

export default SidePanel;
