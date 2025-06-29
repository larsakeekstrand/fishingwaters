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
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  CircularProgress,
  Alert,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import CloseIcon from '@mui/icons-material/Close';

interface SidePanelProps {
  selectedLake: GeoJsonFeature | null;
  open?: boolean;
  onClose?: () => void;
}

const StyledSidePanel = styled(Paper)(({ theme }) => ({
  width: 300,
  padding: theme.spacing(3),
  height: '100vh',
  overflow: 'auto',
  boxShadow: theme.shadows[3],
  zIndex: 1000,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column'
}));

const ContentSection = styled(Box)({
  flex: '1 1 auto',
  overflow: 'auto'
});

const DirectionsSection = styled(Box)(({ theme }) => ({
  flex: '0 0 auto',
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`
}));

const SidePanel: React.FC<SidePanelProps> = ({ selectedLake, open = true, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [locationType, setLocationType] = useState<'current' | 'manual'>('current');
  const [manualAddress, setManualAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const renderCaughtSpecies = (species: string[] | string | undefined): string => {
    if (!species) return 'Inga rapporterade';
    if (Array.isArray(species)) return species.join(', ');
    return species;
  };
  
  const handleGetDirections = async () => {
    setLocationError(null);
    
    if (locationType === 'current') {
      setIsGettingLocation(true);
      
      if (!navigator.geolocation) {
        setLocationError('Din webbläsare stöder inte geolokalisering');
        setIsGettingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsGettingLocation(false);
          const origin = `${position.coords.latitude},${position.coords.longitude}`;
          openGoogleMapsDirections(origin);
        },
        (error) => {
          setIsGettingLocation(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError('Åtkomst till plats nekad');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError('Platsinformation är inte tillgänglig');
              break;
            case error.TIMEOUT:
              setLocationError('Timeout vid hämtning av plats');
              break;
            default:
              setLocationError('Ett okänt fel uppstod');
          }
        }
      );
    } else if (manualAddress.trim()) {
      openGoogleMapsDirections(encodeURIComponent(manualAddress.trim()));
    }
  };

  const openGoogleMapsDirections = (origin: string) => {
    if (!selectedLake) return;
    const [lng, lat] = selectedLake.geometry.coordinates;
    const destination = `${lat},${lng}`;
    const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
    window.open(url, '_blank');
  };

  const content = (
    <>
      {isMobile && onClose && (
        <Box display="flex" justifyContent="flex-end" mb={1}>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      
      {!selectedLake ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body1" color="text.secondary">
            Välj en sjö på kartan för att se mer information
          </Typography>
        </Box>
      ) : (
        <>
          <ContentSection>
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
          </ContentSection>
          
          <DirectionsSection>
            <Typography variant="subtitle2" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsIcon fontSize="small" />
              Vägbeskrivning
            </Typography>
            
            <Stack spacing={2}>
              <ToggleButtonGroup
                value={locationType}
                exclusive
                onChange={(e, newValue) => newValue && setLocationType(newValue)}
                size="small"
                fullWidth
              >
                <ToggleButton value="current">
                  <MyLocationIcon sx={{ mr: 1, fontSize: 18 }} />
                  Min position
                </ToggleButton>
                <ToggleButton value="manual">
                  <LocationOnIcon sx={{ mr: 1, fontSize: 18 }} />
                  Ange adress
                </ToggleButton>
              </ToggleButtonGroup>
              
              {locationType === 'manual' && (
                <TextField
                  size="small"
                  placeholder="Skriv din adress..."
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleGetDirections();
                    }
                  }}
                  fullWidth
                />
              )}
              
              {locationError && (
                <Alert severity="error" sx={{ py: 0.5 }}>
                  {locationError}
                </Alert>
              )}
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleGetDirections}
                disabled={isGettingLocation || (locationType === 'manual' && !manualAddress.trim())}
                startIcon={isGettingLocation ? <CircularProgress size={16} /> : <DirectionsIcon />}
                fullWidth
              >
                {isGettingLocation ? 'Hämtar position...' : 'Få vägbeskrivning'}
              </Button>
            </Stack>
          </DirectionsSection>
        </>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: '85%',
            maxWidth: 400,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box sx={{ padding: theme.spacing(2), height: '100%', display: 'flex', flexDirection: 'column' }}>
          {content}
        </Box>
      </Drawer>
    );
  }

  return (
    <StyledSidePanel>
      {content}
    </StyledSidePanel>
  );
};

export default SidePanel;
