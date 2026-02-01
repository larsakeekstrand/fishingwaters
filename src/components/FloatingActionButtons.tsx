import React, { useState } from 'react';
import {
  Fab,
  Badge,
  Popover,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import FilterListIcon from '@mui/icons-material/FilterList';
import AnchorIcon from '@mui/icons-material/Anchor';
import ClearIcon from '@mui/icons-material/Clear';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import SpeciesFilterPopover from './SpeciesFilterPopover';
import SpeciesFilterSheet from './SpeciesFilterSheet';

interface FloatingActionButtonsProps {
  features: GeoJsonFeature[];
  onFilterChange: (species: Set<string>) => void;
  selectedSpecies: Set<string>;
  onRadiusSearch: (lat: number, lon: number, radius: number) => void;
  showBoatRamps: boolean;
  onBoatRampsToggle: (show: boolean) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  features,
  onFilterChange,
  selectedSpecies,
  onRadiusSearch,
  showBoatRamps,
  onBoatRampsToggle,
  onReset,
  hasActiveFilters
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [locationAnchorEl, setLocationAnchorEl] = useState<HTMLElement | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [radius, setRadius] = useState<string>('20');
  const [userLocation, setUserLocation] = useState<{lat: number; lon: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  const getUserLocation = () => {
    setIsGettingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          alert('Kunde inte hämta din position. Kontrollera att du har tillåtit platsåtkomst.');
        }
      );
    } else {
      alert('Platshämtning stöds inte i din webbläsare.');
      setIsGettingLocation(false);
    }
  };

  const handleRadiusSearchClick = () => {
    if (userLocation) {
      const radiusNum = parseFloat(radius);
      if (!isNaN(radiusNum) && radiusNum > 0) {
        onRadiusSearch(userLocation.lat, userLocation.lon, radiusNum);
        setLocationAnchorEl(null);
        setLocationSheetOpen(false);
      }
    }
  };

  const handleGpsFabClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isMobile) {
      setLocationSheetOpen(true);
    } else {
      setLocationAnchorEl(event.currentTarget);
    }
  };

  const handleFilterFabClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isMobile) {
      setFilterSheetOpen(true);
    } else {
      setFilterAnchorEl(event.currentTarget);
    }
  };

  const handleBoatRampsFabClick = () => {
    onBoatRampsToggle(!showBoatRamps);
  };

  const locationContent = (
    <Stack spacing={2}>
      <Typography variant="subtitle1" gutterBottom>
        Sök sjöar inom radie
      </Typography>
      <Button
        variant="contained"
        fullWidth
        onClick={getUserLocation}
        disabled={isGettingLocation}
        startIcon={<GpsFixedIcon />}
      >
        {isGettingLocation ? 'Hämtar position...' :
         userLocation ? 'Uppdatera position' : 'Hämta min position'}
      </Button>

      {userLocation && (
        <>
          <Typography variant="caption" color="text.secondary">
            Position: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="Radie"
              sx={{ width: 100 }}
              slotProps={{
                htmlInput: { min: 1, max: 500 }
              }}
            />
            <Typography variant="body2">km</Typography>
            <Button
              variant="contained"
              size="small"
              onClick={handleRadiusSearchClick}
            >
              Sök
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );

  return (
    <>
      {/* FAB Stack */}
      <Box
        data-testid="floating-action-buttons"
        sx={{
          position: 'absolute',
          right: isMobile ? 12 : 16,
          ...(isMobile
            ? { bottom: 100 }
            : { top: '50%', transform: 'translateY(-50%)' }),
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          pointerEvents: 'auto',
        }}
      >
        {/* GPS / Nearby */}
        <Fab
          size="medium"
          aria-label="Närliggande"
          onClick={handleGpsFabClick}
          sx={{
            backgroundColor: 'white',
            color: 'text.primary',
            '&:hover': { backgroundColor: 'grey.100' },
          }}
        >
          <GpsFixedIcon />
        </Fab>

        {/* Species Filter */}
        <Fab
          size="medium"
          aria-label="Artfilter"
          onClick={handleFilterFabClick}
          sx={{
            backgroundColor: 'white',
            color: 'text.primary',
            '&:hover': { backgroundColor: 'grey.100' },
          }}
        >
          <Badge badgeContent={selectedSpecies.size} color="primary">
            <FilterListIcon />
          </Badge>
        </Fab>

        {/* Boat Ramps Toggle */}
        <Fab
          size="medium"
          aria-label="Båtramper"
          onClick={handleBoatRampsFabClick}
          sx={{
            backgroundColor: showBoatRamps ? 'primary.main' : 'white',
            color: showBoatRamps ? 'white' : 'text.primary',
            '&:hover': {
              backgroundColor: showBoatRamps ? 'primary.dark' : 'grey.100',
            },
          }}
        >
          <AnchorIcon />
        </Fab>

        {/* Reset */}
        {hasActiveFilters && (
          <Fab
            size="medium"
            aria-label="Återställ"
            onClick={onReset}
            sx={{
              backgroundColor: 'error.main',
              color: 'white',
              '&:hover': { backgroundColor: 'error.dark' },
            }}
          >
            <ClearIcon />
          </Fab>
        )}
      </Box>

      {/* Desktop: Location Popover */}
      <Popover
        open={Boolean(locationAnchorEl)}
        anchorEl={locationAnchorEl}
        onClose={() => setLocationAnchorEl(null)}
        anchorOrigin={{ vertical: 'center', horizontal: 'left' }}
        transformOrigin={{ vertical: 'center', horizontal: 'right' }}
      >
        <Paper sx={{ p: 3, minWidth: 300, borderRadius: '12px' }}>
          {locationContent}
        </Paper>
      </Popover>

      {/* Mobile: Location Bottom Sheet */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            display: locationSheetOpen ? 'block' : 'none',
            pointerEvents: locationSheetOpen ? 'auto' : 'none',
          }}
        >
          <Box
            sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setLocationSheetOpen(false)}
          />
          <Paper
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              p: 3,
              pt: 4,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 4,
                bgcolor: 'grey.300',
                borderRadius: 2,
                mx: 'auto',
                mb: 2,
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
            {locationContent}
          </Paper>
        </Box>
      )}

      {/* Desktop: Species Filter Popover */}
      {!isMobile && (
        <SpeciesFilterPopover
          anchorEl={filterAnchorEl}
          onClose={() => setFilterAnchorEl(null)}
          features={features}
          onFilterChange={onFilterChange}
          selectedSpecies={selectedSpecies}
        />
      )}

      {/* Mobile: Species Filter Sheet */}
      {isMobile && (
        <SpeciesFilterSheet
          open={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          onOpen={() => setFilterSheetOpen(true)}
          features={features}
          onFilterChange={onFilterChange}
          selectedSpecies={selectedSpecies}
        />
      )}
    </>
  );
};

export default FloatingActionButtons;
