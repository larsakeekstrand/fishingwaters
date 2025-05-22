import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Paper,
  Typography,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface LakeSearchProps {
  features: GeoJsonFeature[];
  onLakeSelect: (lake: GeoJsonFeature) => void;
  onMapRefocus: (coordinates: [number, number]) => void;
}

interface LakeOption {
  label: string;
  lake: GeoJsonFeature;
  county: string;
}

const LakeSearch: React.FC<LakeSearchProps> = ({ features, onLakeSelect, onMapRefocus }) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<LakeOption[]>([]);

  // Create searchable options from features
  useEffect(() => {
    const lakeOptions: LakeOption[] = features.map(feature => ({
      label: feature.properties.name || feature.properties.sjö || 'Namnlös sjö',
      lake: feature,
      county: feature.properties.county || feature.properties.län || 'Okänt län'
    }));

    // Sort by name for better UX
    lakeOptions.sort((a, b) => a.label.localeCompare(b.label, 'sv-SE'));
    setOptions(lakeOptions);
  }, [features]);

  const handleLakeSelect = (event: any, value: LakeOption | null) => {
    if (value) {
      const { coordinates } = value.lake.geometry;
      // Leaflet uses [lat, lng] whereas GeoJSON uses [lng, lat]
      const position: [number, number] = [coordinates[1], coordinates[0]];
      
      onLakeSelect(value.lake);
      onMapRefocus(position);
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.label}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {option.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.county}
              </Typography>
            </Box>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Sök efter sjö..."
            variant="outlined"
            size="small"
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
        onChange={handleLakeSelect}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        PaperComponent={({ children, ...props }) => (
          <Paper {...props} elevation={8}>
            {children}
          </Paper>
        )}
        noOptionsText="Inga sjöar hittades"
        loadingText="Söker..."
        clearOnEscape
        blurOnSelect
        selectOnFocus
        handleHomeEndKeys
      />
    </Box>
  );
};

export default LakeSearch;