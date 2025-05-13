import React, { useEffect, useState } from 'react';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import { 
  Paper,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  Divider,
  Box,
  IconButton
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { styled } from '@mui/material/styles';

interface SpeciesFilterProps {
  features: GeoJsonFeature[];
  onFilterChange: (selectedSpecies: Set<string>) => void;
}

const StyledFilterPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(2),
  zIndex: 1000,
  maxHeight: '80vh',
  overflow: 'auto',
  width: 250,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.3s ease-in-out'
}));

const MinimizedPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(1),
  zIndex: 1000,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center'
}));

const SpeciesFilter: React.FC<SpeciesFilterProps> = ({ features, onFilterChange }) => {
  const [uniqueSpecies, setUniqueSpecies] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Set<string>>(new Set());
  const [minimized, setMinimized] = useState<boolean>(false);

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
    
    setSelectedSpecies(newSelectedSpecies);
    onFilterChange(newSelectedSpecies);
  };

  const handleSelectAll = () => {
    const allSpecies = new Set(uniqueSpecies);
    setSelectedSpecies(allSpecies);
    onFilterChange(allSpecies);
  };

  const handleClearAll = () => {
    setSelectedSpecies(new Set());
    onFilterChange(new Set());
  };

  const toggleMinimized = () => {
    setMinimized(!minimized);
  };

  if (minimized) {
    return (
      <MinimizedPanel className="filter-panel-minimized">
        <IconButton 
          onClick={toggleMinimized}
          aria-label="Expand filter panel"
          title="Visa filterpanel"
          color="primary"
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="subtitle2" color="primary" sx={{ ml: 1 }}>
          {selectedSpecies.size > 0 ? `${selectedSpecies.size} arter valda` : 'Filter'}
        </Typography>
      </MinimizedPanel>
    );
  }

  return (
    <StyledFilterPanel className="filter-panel">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1" color="primary" fontWeight="medium" className="filter-header">
          Filtrera efter arter
        </Typography>
        <IconButton 
          onClick={toggleMinimized}
          aria-label="Minimize filter panel"
          title="Minimera filterpanel"
          size="small"
          color="primary"
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
      
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={handleSelectAll}
          color="primary"
        >
          Välj alla
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={handleClearAll}
          color="secondary"
        >
          Rensa alla
        </Button>
      </Stack>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
        <FormGroup>
          {uniqueSpecies.map(species => (
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
          ))}
        </FormGroup>
      </Box>
    </StyledFilterPanel>
  );
};

export default SpeciesFilter;
