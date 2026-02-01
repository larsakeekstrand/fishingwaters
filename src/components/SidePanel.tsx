import React, { useState, useEffect } from 'react';
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
  SwipeableDrawer,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import CloseIcon from '@mui/icons-material/Close';
import { PressureChart } from './PressureChart';
import { WeatherService } from '../services/weatherService';

interface SidePanelProps {
  selectedLake: GeoJsonFeature | null;
  open: boolean;
  onClose: () => void;
}

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

const SidePanel: React.FC<SidePanelProps> = ({ selectedLake, open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [locationType, setLocationType] = useState<'current' | 'manual'>('current');
  const [manualAddress, setManualAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pressureData, setPressureData] = useState<any>(null);
  const [pressureLoading, setPressureLoading] = useState(false);
  const [pressureError, setPressureError] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    if (selectedLake) {
      const [lng, lat] = selectedLake.geometry.coordinates;
      setPressureLoading(true);
      setPressureError(null);

      WeatherService.fetchPressureData(lat, lng)
        .then(data => {
          setPressureData(data);
          setPressureLoading(false);
        })
        .catch(() => {
          setPressureError('Kunde inte hämta väderdata');
          setPressureLoading(false);
        });
    }
  }, [selectedLake]);

  useEffect(() => {
    if (!open) {
      setMobileExpanded(false);
    }
  }, [open]);

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

  const fullContent = (
    <>
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

            <Divider sx={{ my: 2 }} />

            <PressureChart
              data={pressureData}
              loading={pressureLoading}
              error={pressureError}
            />
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
                onChange={(_e, newValue) => newValue && setLocationType(newValue)}
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

  // Mobile: Bottom sheet with peek/full states
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            height: mobileExpanded ? '90vh' : 'auto',
            maxHeight: '90vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            pointerEvents: 'auto',
            overflow: 'visible',
          },
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {/* Drag handle */}
        <Box
          sx={{
            width: 32,
            height: 4,
            bgcolor: 'grey.300',
            borderRadius: 2,
            mx: 'auto',
            mt: 1,
            mb: 0.5,
          }}
        />

        {!mobileExpanded ? (
          // Peek state
          <Box
            onClick={() => setMobileExpanded(true)}
            sx={{ px: 2, pb: 2, pt: 1, cursor: 'pointer', minHeight: 80 }}
          >
            {selectedLake && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {selectedLake.properties.name}
                  </Typography>
                  <IconButton onClick={(e) => { e.stopPropagation(); onClose(); }} size="small">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {selectedLake.properties.county}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Tryck för att visa mer
                </Typography>
              </>
            )}
          </Box>
        ) : (
          // Full state
          <Box sx={{ px: 2, pb: 2, pt: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton onClick={() => setMobileExpanded(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {fullContent}
            </Box>
          </Box>
        )}
      </SwipeableDrawer>
    );
  }

  // Desktop: Floating slide-in panel
  return (
    <Slide direction="right" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={4}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          bottom: 16,
          width: 350,
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        {/* Close button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, pb: 0 }}>
          <IconButton onClick={onClose} size="small" data-testid="side-panel-close">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
          {fullContent}
        </Box>
      </Paper>
    </Slide>
  );
};

export default SidePanel;
