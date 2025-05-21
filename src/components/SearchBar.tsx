import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Autocomplete, 
  Box, 
  Paper,
  styled
} from '@mui/material';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface SearchBarProps {
  lakes: GeoJsonFeature[];
  onLakeSelect: (lake: GeoJsonFeature) => void;
}

const StyledSearchBar = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  width: '300px',
  zIndex: 1000,
  boxShadow: theme.shadows[3],
}));

const SearchBar: React.FC<SearchBarProps> = ({ lakes, onLakeSelect }) => {
  const [options, setOptions] = useState<GeoJsonFeature[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState<GeoJsonFeature | null>(null);

  useEffect(() => {
    setOptions(lakes);
  }, [lakes]);

  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: GeoJsonFeature | null) => {
    setValue(newValue);
    if (newValue) {
      onLakeSelect(newValue);
    }
  };

  return (
    <StyledSearchBar>
      <Autocomplete
        id="lake-search"
        options={options}
        getOptionLabel={(option) => option.properties.name}
        value={value}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        filterOptions={(options, { inputValue }) => {
          const inputValueLower = inputValue.toLowerCase();
          return options.filter(option => 
            option.properties.name.toLowerCase().includes(inputValueLower)
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Sök sjö"
            variant="outlined"
            fullWidth
            size="small"
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <Box component="li" key={key} {...otherProps}>
              {option.properties.name} - {option.properties.county}
            </Box>
          );
        }}
        noOptionsText="Inga sjöar hittades"
      />
    </StyledSearchBar>
  );
};

export default SearchBar;