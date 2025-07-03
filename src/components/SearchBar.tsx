import React, { useState, useMemo } from 'react';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import {
  Autocomplete,
  TextField,
  Paper,
  InputAdornment,
  Box,
  useMediaQuery,
  useTheme,
  Stack,
  Button,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

interface SearchBarProps {
  lakes: GeoJsonFeature[];
  onLakeSelect: (lake: GeoJsonFeature) => void;
  onRadiusSearch?: (userLat: number, userLon: number, radius: number) => void;
}

const StyledSearchContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1100,
  width: '90%',
  maxWidth: 400,
  boxShadow: theme.shadows[3],
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: '85%',
    maxWidth: 'none',
  }
}));

const SearchBar: React.FC<SearchBarProps> = ({ lakes, onLakeSelect, onRadiusSearch }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [radius, setRadius] = useState<string>('10');
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Create searchable lake options with normalized names for better matching
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
    if (!inputValue) return [];
    
    const searchTerm = inputValue.toLowerCase();
    return lakeOptions
      .filter(option => 
        option.normalizedLabel.includes(searchTerm) ||
        option.county?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10); // Limit to 10 suggestions for performance
  }, [inputValue, lakeOptions]);

  const handleLakeSelection = (event: any, value: any) => {
    if (value && value.lake) {
      onLakeSelect(value.lake);
      // Clear input after selection on mobile for better UX
      if (isMobile) {
        setInputValue('');
      }
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

  const handleRadiusSearch = () => {
    if (userLocation && onRadiusSearch) {
      const radiusNum = parseFloat(radius);
      if (!isNaN(radiusNum) && radiusNum > 0) {
        onRadiusSearch(userLocation.lat, userLocation.lon, radiusNum);
      }
    }
  };

  return (
    <StyledSearchContainer elevation={3}>
      <Stack spacing={2}>
        <Autocomplete
          options={filteredOptions}
          getOptionLabel={(option) => option.label}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props as any;
            return (
              <Box component="li" key={key} {...otherProps}>
                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                <Box>
                  <Box component="span" sx={{ fontWeight: 'medium' }}>
                    {option.label}
                  </Box>
                  {option.county && (
                    <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                      {option.county}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          }}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
          }}
          onChange={handleLakeSelection}
          noOptionsText="Ingen sjö hittades"
          loadingText="Söker..."
          clearOnEscape
          blurOnSelect
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Sök efter sjö..."
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }
              }}
            />
          )}
        />
        
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Sök inom radie
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              onClick={getUserLocation}
              disabled={isGettingLocation}
              startIcon={<GpsFixedIcon />}
            >
              {isGettingLocation ? 'Hämtar...' : 'Hämta position'}
            </Button>
            <TextField
              size="small"
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="Radie"
              sx={{ width: 80 }}
              slotProps={{
                htmlInput: { min: 1, max: 500 }
              }}
            />
            <Typography variant="body2" color="text.secondary">
              km
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={handleRadiusSearch}
              disabled={!userLocation}
            >
              Sök
            </Button>
          </Stack>
          {userLocation && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Position: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
            </Typography>
          )}
        </Box>
      </Stack>
    </StyledSearchContainer>
  );
};

export default SearchBar;