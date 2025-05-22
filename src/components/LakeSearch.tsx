import React, { useState, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface LakeSearchProps {
  features: GeoJsonFeature[];
  onLakeSelect: (lake: GeoJsonFeature) => void;
}

const SearchContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 1000,
  padding: theme.spacing(1),
  minWidth: 300,
  maxWidth: 400,
  boxShadow: theme.shadows[3],
}));

interface LakeOption {
  lake: GeoJsonFeature;
  label: string;
  county: string;
}

const LakeSearch: React.FC<LakeSearchProps> = ({ features, onLakeSelect }) => {
  const [searchValue, setSearchValue] = useState<string>('');

  // Prepare search options from lake features
  const lakeOptions = useMemo<LakeOption[]>(() => {
    return features
      .filter(feature => feature.properties.name) // Only include lakes with names
      .map(feature => ({
        lake: feature,
        label: feature.properties.name,
        county: feature.properties.county || 'Okänt län',
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'sv-SE')); // Sort alphabetically in Swedish
  }, [features]);

  const handleLakeSelect = (event: React.SyntheticEvent, value: LakeOption | null) => {
    if (value) {
      onLakeSelect(value.lake);
      setSearchValue(value.label);
    }
  };

  const handleInputChange = (event: React.SyntheticEvent, value: string) => {
    setSearchValue(value);
  };

  const filterOptions = (options: LakeOption[], { inputValue }: { inputValue: string }) => {
    const filterValue = inputValue.toLowerCase();
    return options.filter(option => 
      option.label.toLowerCase().includes(filterValue) ||
      option.county.toLowerCase().includes(filterValue)
    );
  };

  return (
    <SearchContainer elevation={3}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <SearchIcon color="primary" />
        <Typography variant="h6" color="primary">
          Sök sjö
        </Typography>
      </Box>
      
      <Autocomplete
        options={lakeOptions}
        getOptionLabel={(option) => option.label}
        value={lakeOptions.find(option => option.label === searchValue) || null}
        onChange={handleLakeSelect}
        onInputChange={handleInputChange}
        filterOptions={filterOptions}
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
          const { key, ...optionProps } = props;
          return (
            <Box component="li" key={key} {...optionProps}>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {option.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.county}
                </Typography>
              </Box>
            </Box>
          );
        }}
        noOptionsText="Ingen sjö hittades"
        clearOnBlur={false}
        selectOnFocus
        handleHomeEndKeys
      />
    </SearchContainer>
  );
};

export default LakeSearch;