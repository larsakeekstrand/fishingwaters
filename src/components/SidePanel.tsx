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
    </StyledSidePanel>
  );
}

const DriveDirections: React.FC<SidePanelProps> = ({ selectedLake }) => {
  const [startLocation, setStartLocation] = React.useState('');
import { GoogleMapsLoader } from '@googlemaps/js-api-loader';
import { Box, Button, Divider, TextField, Typography } from '@mui/material';

const googleMapsLoader = new GoogleMapsLoader({
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
});

const handleGetDirections = async (selectedLake: GeoJsonFeature, startLocation: string) => {
  if (!selectedLake) {
    return;
  }

  if (!startLocation) {
    alert('Please enter a starting location');
    return;
  }

  try {
    await googleMapsLoader.load();
    const directionsService = new google.maps.DirectionsService();
    const directionsRequest = {
      origin: startLocation,
      destination: `${selectedLake.geometry.coordinates[1]}, ${selectedLake.geometry.coordinates[0]}`,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(directionsRequest, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        // Display the driving directions and route on the map
        console.log(result.routes[0].legs[0].steps);
      } else {
        console.error('Directions request failed:', status);
      }
    });
  } catch (error) {
    console.error('Error loading Google Maps API:', error);
  }
};

const DriveDirections: React.FC<SidePanelProps> = ({ selectedLake }) => {
  const [startLocation, setStartLocation] = React.useState('');

  return (
    <Box mt={4}>
      <Divider />
      <Typography variant="h6" component="h3" gutterBottom color="primary" mt={2}>
        Driving Directions
      </Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          label="Starting Location"
          variant="outlined"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={() => handleGetDirections(selectedLake, startLocation)} sx={{ ml: 2 }}>
          Get Directions
        </Button>
      </Box>
      {/* TODO: Display the driving directions and route on the map */}
    </Box>
  );
};

export default SidePanel;

  const handleGetDirections = () => {
    if (!selectedLake) {
      return;
    }

    if (!startLocation) {
      alert('Please enter a starting location');
      return;
    }

    // TODO: Integrate with a mapping API to get the driving directions
    console.log(`Getting directions from ${startLocation} to ${selectedLake.properties.name}`);
  };

  return (
    <Box mt={4}>
      <Divider />
      <Typography variant="h6" component="h3" gutterBottom color="primary" mt={2}>
        Driving Directions
      </Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          label="Starting Location"
          variant="outlined"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleGetDirections} sx={{ ml: 2 }}>
          Get Directions
        </Button>
      </Box>
      {/* TODO: Display the driving directions and route on the map */}
    </Box>
  );
};

export default SidePanel;
