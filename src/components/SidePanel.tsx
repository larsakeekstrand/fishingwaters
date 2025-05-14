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
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useWeatherData } from '../utils/weatherService';

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

  // Extract coordinates from the selected lake's geometry
  const { coordinates } = selectedLake.geometry;
  // GeoJSON uses [longitude, latitude] format, but our weather API needs [latitude, longitude]
  const [longitude, latitude] = coordinates;
  
  // Fetch weather data for the lake coordinates
  const { temperature, windSpeed, weatherDescription, isLoading, error } = useWeatherData(latitude, longitude);

  return (
    <StyledSidePanel>
      <Typography variant="h5" component="h2" gutterBottom color="primary">
        {selectedLake.properties.name}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List disablePadding>
        {/* Weather section */}
        <ListItem>
          <Box width="100%">
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Aktuellt väder
            </Typography>
            
            {isLoading ? (
              <Box display="flex" alignItems="center" mt={1}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Laddar väderdata...</Typography>
              </Box>
            ) : error ? (
              <Typography variant="body2" color="error">
                Kunde inte ladda väderdata: {error}
              </Typography>
            ) : (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  {weatherDescription}, {temperature}°C
                </Typography>
                <Typography variant="body2">
                  Vindhastighet: {windSpeed} m/s
                </Typography>
              </Box>
            )}
          </Box>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        
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
