import React, { useEffect, useState } from 'react';
import {
  Popover,
  Paper,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  Divider,
  Box,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface SpeciesFilterPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  features: GeoJsonFeature[];
  onFilterChange: (selectedSpecies: Set<string>) => void;
  selectedSpecies: Set<string>;
}

const SpeciesFilterPopover: React.FC<SpeciesFilterPopoverProps> = ({
  anchorEl,
  onClose,
  features,
  onFilterChange,
  selectedSpecies
}) => {
  const [uniqueSpecies, setUniqueSpecies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const speciesSet = new Set<string>();
    
    features.forEach(feature => {
      const species = feature.properties.catchedSpecies || feature.properties.fångadeArter;
      
      if (species) {
        if (Array.isArray(species)) {
          species.forEach(s => speciesSet.add(s));
        } else if (typeof species === 'string') {
          if (species.includes(',')) {
            species.split(',').map(s => s.trim()).forEach(s => speciesSet.add(s));
          } else {
            speciesSet.add(species);
          }
        }
      }
    });
    
    setUniqueSpecies(Array.from(speciesSet).sort());
  }, [features]);

  const handleCheckboxChange = (species: string, checked: boolean) => {
    const newSelectedSpecies = new Set(selectedSpecies);
    
    if (checked) {
      newSelectedSpecies.add(species);
    } else {
      newSelectedSpecies.delete(species);
    }
    
    onFilterChange(newSelectedSpecies);
  };

  const handleSelectAll = () => {
    const allSpecies = new Set(uniqueSpecies);
    onFilterChange(allSpecies);
  };

  const handleClearAll = () => {
    onFilterChange(new Set());
  };

  const filteredSpecies = uniqueSpecies.filter(species =>
    species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: { width: 320, maxHeight: 500 }
      }}
    >
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filtrera efter arter
        </Typography>
        
        <Stack spacing={2}>
          <TextField
            size="small"
            placeholder="Sök arter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }
            }}
          />
          
          <Stack direction="row" spacing={1}>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={handleSelectAll}
              fullWidth
            >
              Välj alla
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={handleClearAll}
              fullWidth
              color="secondary"
            >
              Rensa alla
            </Button>
          </Stack>
          
          <Divider />
          
          <Box sx={{ 
            maxHeight: 300, 
            overflow: 'auto',
            pr: 1
          }}>
            <FormGroup>
              {filteredSpecies.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Inga arter hittades
                </Typography>
              ) : (
                filteredSpecies.map(species => (
                  <FormControlLabel
                    key={species}
                    control={
                      <Checkbox
                        checked={selectedSpecies.has(species)}
                        onChange={(e) => handleCheckboxChange(species, e.target.checked)}
                        size="small"
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">{species}</Typography>
                    }
                    sx={{ mb: 0.5 }}
                  />
                ))
              )}
            </FormGroup>
          </Box>
          
          <Box sx={{ 
            pt: 1, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="caption" color="text.secondary">
              {selectedSpecies.size} av {uniqueSpecies.length} valda
            </Typography>
            <Button size="small" onClick={onClose}>
              Stäng
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Popover>
  );
};

export default SpeciesFilterPopover;