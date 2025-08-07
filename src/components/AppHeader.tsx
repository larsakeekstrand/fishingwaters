import React, { useState, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  TextField,
  Autocomplete,
  IconButton,
  Switch,
  FormControlLabel,
  InputAdornment,
  Popover,
  Paper,
  useMediaQuery,
  useTheme,
  Typography,
  Button,
  Stack,
  Chip,
  Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AnchorIcon from '@mui/icons-material/Anchor';
import MenuIcon from '@mui/icons-material/Menu';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import SpeciesFilterPopover from './SpeciesFilterPopover';

interface AppHeaderProps {
  lakes: GeoJsonFeature[];
  features: GeoJsonFeature[];
  onLakeSelect: (lake: GeoJsonFeature) => void;
  onFilterChange: (species: Set<string>) => void;
  onRadiusSearch: (lat: number, lon: number, radius: number) => void;
  showBoatRamps: boolean;
  onBoatRampsToggle: (show: boolean) => void;
  onMobileMenuOpen?: () => void;
  selectedSpeciesCount: number;
  selectedSpecies: Set<string>;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  lakes,
  features,
  onLakeSelect,
  onFilterChange,
  onRadiusSearch,
  showBoatRamps,
  onBoatRampsToggle,
  onMobileMenuOpen,
  selectedSpeciesCount,
  selectedSpecies
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [searchInput, setSearchInput] = useState<string>('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [locationAnchorEl, setLocationAnchorEl] = useState<HTMLElement | null>(null);
  const [radius, setRadius] = useState<string>('10');
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  // Create searchable lake options
  const lakeOptions = useMemo(() => {
    return lakes.map(lake => ({
      lake,
      label: lake.properties.name,
      normalizedLabel: lake.properties.name.toLowerCase(),
      county: lake.properties.county
    }));
  }, [lakes]);

  // Filter options based on input
  const filteredOptions = useMemo(() => {
    if (!searchInput) return [];
    
    const searchTerm = searchInput.toLowerCase();
    return lakeOptions
      .filter(option => 
        option.normalizedLabel.includes(searchTerm) ||
        option.county?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10);
  }, [searchInput, lakeOptions]);

  const handleLakeSelection = (event: any, value: any) => {
    if (value && value.lake) {
      onLakeSelect(value.lake);
      setSearchInput('');
    }
  };

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
    if (userLocation && onRadiusSearch) {
      const radiusNum = parseFloat(radius);
      if (!isNaN(radiusNum) && radiusNum > 0) {
        onRadiusSearch(userLocation.lat, userLocation.lon, radiusNum);
        setLocationAnchorEl(null);
      }
    }
  };

  // Mobile simplified header
  if (isMobile) {
    return (
      <AppBar 
        position="fixed" 
        elevation={2}
        sx={{ 
          backgroundColor: 'background.paper',
          color: 'text.primary',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ minHeight: 56, px: 2 }}>
          <Autocomplete
            options={filteredOptions}
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props as any;
              return (
                <Box component="li" key={key} {...otherProps}>
                  <LocationOnIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">{option.label}</Typography>
                    {option.county && (
                      <Typography variant="caption" color="text.secondary">
                        {option.county}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            }}
            inputValue={searchInput}
            onInputChange={(_, newInputValue) => setSearchInput(newInputValue)}
            onChange={handleLakeSelection}
            noOptionsText="Ingen sjö hittades"
            sx={{ flexGrow: 1, mr: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Sök sjö..."
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.default',
                    '& fieldset': { borderColor: 'divider' }
                  }
                }}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }
                }}
              />
            )}
          />
          
          <IconButton 
            onClick={onMobileMenuOpen}
            edge="end"
            color="primary"
          >
            <Badge badgeContent={selectedSpeciesCount} color="secondary">
              <MenuIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }

  // Desktop/Tablet full header
  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={2}
        sx={{ 
          backgroundColor: 'background.paper',
          color: 'text.primary',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {/* Search Bar */}
          <Autocomplete
            options={filteredOptions}
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props as any;
              return (
                <Box component="li" key={key} {...otherProps}>
                  <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body1">{option.label}</Typography>
                    {option.county && (
                      <Typography variant="caption" color="text.secondary">
                        {option.county}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            }}
            inputValue={searchInput}
            onInputChange={(_, newInputValue) => setSearchInput(newInputValue)}
            onChange={handleLakeSelection}
            noOptionsText="Ingen sjö hittades"
            sx={{ 
              minWidth: isTablet ? 250 : 350,
              maxWidth: 450 
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Sök efter sjö..."
                variant="outlined"
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.default',
                  }
                }}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }
                }}
              />
            )}
          />

          {/* GPS Location Button */}
          <Button
            variant="outlined"
            startIcon={<GpsFixedIcon />}
            onClick={(e) => setLocationAnchorEl(e.currentTarget)}
            sx={{ minWidth: 140 }}
          >
            Närliggande
          </Button>

          {/* Species Filter Button */}
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            endIcon={
              selectedSpeciesCount > 0 && (
                <Chip 
                  label={selectedSpeciesCount} 
                  size="small" 
                  color="primary"
                  sx={{ height: 20, minWidth: 20 }}
                />
              )
            }
          >
            Arter
          </Button>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Boat Ramps Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={showBoatRamps}
                onChange={(e) => onBoatRampsToggle(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AnchorIcon fontSize="small" />
                <span>Båtramper</span>
              </Box>
            }
          />
        </Toolbar>
      </AppBar>

      {/* Location Popover */}
      <Popover
        open={Boolean(locationAnchorEl)}
        anchorEl={locationAnchorEl}
        onClose={() => setLocationAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 3, minWidth: 300 }}>
          <Typography variant="subtitle1" gutterBottom>
            Sök sjöar inom radie
          </Typography>
          <Stack spacing={2}>
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
        </Paper>
      </Popover>

      {/* Species Filter Popover */}
      <SpeciesFilterPopover
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        features={features}
        onFilterChange={onFilterChange}
        selectedSpecies={selectedSpecies}
      />
    </>
  );
};

export default AppHeader;