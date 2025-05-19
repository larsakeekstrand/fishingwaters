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
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface SidePanelProps {
  selectedLake: GeoJsonFeature | null;
}

interface StyledSidePanelProps {
  isMinimized: boolean;
}

const StyledSidePanel = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isMinimized'
})<StyledSidePanelProps>(({ theme, isMinimized }) => ({
  width: isMinimized ? 42 : 300,
  padding: isMinimized ? theme.spacing(1, 0) : theme.spacing(3),
  height: '100vh',
  overflow: 'auto',
  boxShadow: theme.shadows[3],
  zIndex: 1000,
  position: 'relative',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
}));

const SidePanel: React.FC<SidePanelProps> = ({ selectedLake }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Render the minimize/maximize button
  const MinimizeButton = () => (
    <IconButton
      onClick={toggleMinimize}
      sx={{
        position: 'absolute',
        right: isMinimized ? '4px' : '12px',
        top: '12px',
        zIndex: 1100,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        border: '1px solid #eee',
      }}
      size="small"
      aria-label={isMinimized ? 'Expand panel' : 'Minimize panel'}
      title={isMinimized ? 'Visa panel' : 'Minimera panel'}
    >
      {isMinimized ? <ChevronRightIcon /> : <ChevronLeftIcon />}
    </IconButton>
  );

  if (!selectedLake) {
    return (
      <StyledSidePanel isMinimized={isMinimized}>
        <MinimizeButton />
        {!isMinimized && (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="body1" color="text.secondary">
              Välj en sjö på kartan för att se mer information
            </Typography>
          </Box>
        )}
      </StyledSidePanel>
    );
  }

  const renderCaughtSpecies = (species: string[] | string | undefined): string => {
    if (!species) return 'Inga rapporterade';
    if (Array.isArray(species)) return species.join(', ');
    return species;
  };

  return (
    <StyledSidePanel isMinimized={isMinimized}>
      <MinimizeButton />
      
      {!isMinimized && (
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
