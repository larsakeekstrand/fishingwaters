import React, { useState, useMemo } from 'react';
import {
  Paper,
  Autocomplete,
  TextField,
  InputAdornment,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface FloatingSearchBarProps {
  lakes: GeoJsonFeature[];
  onLakeSelect: (lake: GeoJsonFeature) => void;
}

const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({ lakes, onLakeSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchInput, setSearchInput] = useState<string>('');

  const lakeOptions = useMemo(() => {
    return lakes.map(lake => ({
      lake,
      label: lake.properties.name,
      normalizedLabel: lake.properties.name.toLowerCase(),
      county: lake.properties.county
    }));
  }, [lakes]);

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

  const handleLakeSelection = (_event: any, value: any) => {
    if (value && value.lake) {
      onLakeSelect(value.lake);
      setSearchInput('');
    }
  };

  return (
    <Fade in timeout={600}>
      <Paper
        data-testid="floating-search-bar"
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? 'calc(100% - 24px)' : 400,
          maxWidth: isMobile ? undefined : '50%',
          borderRadius: '24px',
          pointerEvents: 'auto',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          zIndex: 1,
          ...(isMobile && {
            left: 12,
            right: 12,
            transform: 'none',
            width: 'auto',
          }),
        }}
      >
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
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Sök sjö..."
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                  backgroundColor: 'transparent',
                  '& fieldset': { border: 'none' },
                },
              }}
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Paper>
    </Fade>
  );
};

export default FloatingSearchBar;
