import React, { useState, useEffect, useMemo } from 'react';
import {
  TextField,
  Autocomplete,
  Paper,
  Box,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface LakeSearchProps {
  features: GeoJsonFeature[];
  onLakeSelect: (lake: GeoJsonFeature) => void;
}

const StyledSearchPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(2),
  zIndex: 999, // Below filter panel
  width: 250,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1)
}));

const LakeSearch: React.FC<LakeSearchProps> = ({ features, onLakeSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedLake, setSelectedLake] = useState<GeoJsonFeature | null>(null);

  // Create searchable lake options
  const lakeOptions = useMemo(() => {
    return features.map(feature => ({
      label: feature.properties.name,
      feature: feature
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [features]);

  const handleLakeSelection = (event: any, value: { label: string; feature: GeoJsonFeature } | null) => {
    if (value) {
      setSelectedLake(value.feature);
      onLakeSelect(value.feature);
    }
  };

  return (
    <StyledSearchPanel>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <SearchIcon color="primary" />
        <Typography variant="subtitle1" color="primary" fontWeight="medium">
          Sök sjö
        </Typography>
      </Box>
      <Autocomplete
        value={selectedLake ? { label: selectedLake.properties.name, feature: selectedLake } : null}
        onChange={handleLakeSelection}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        options={lakeOptions}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.label === value.label}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Skriv sjönamn..."
            variant="outlined"
            size="small"
            fullWidth
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props as any;
          return (
            <Box component="li" key={key} {...otherProps}>
              <Box>
                <Typography variant="body2">{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.feature.properties.county}
                </Typography>
              </Box>
            </Box>
          );
        }}
        noOptionsText="Ingen sjö hittades"
      />
    </StyledSearchPanel>
  );
};

export default LakeSearch;