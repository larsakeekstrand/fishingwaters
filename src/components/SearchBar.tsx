import React, { useState, useMemo } from 'react';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import {
  Autocomplete,
  TextField,
  Paper,
  InputAdornment,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface SearchBarProps {
  lakes: GeoJsonFeature[];
  onLakeSelect: (lake: GeoJsonFeature) => void;
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
  [theme.breakpoints.down('sm')]: {
    width: '85%',
    maxWidth: 'none',
  }
}));

const SearchBar: React.FC<SearchBarProps> = ({ lakes, onLakeSelect }) => {
  const [inputValue, setInputValue] = useState<string>('');
  
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

  return (
    <StyledSearchContainer elevation={3}>
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
        onInputChange={(event, newInputValue) => {
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
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </StyledSearchContainer>
  );
};

export default SearchBar;