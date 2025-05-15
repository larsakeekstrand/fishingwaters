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
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

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
  transition: 'width 0.3s ease-in-out'
}));

const MinimizeButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  zIndex: 1100,
  padding: theme.spacing(0.5)
}));

const CollapsedPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(1),
  zIndex: 1000,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const SpeciesFilter: React.FC<SpeciesFilterProps> = ({ features, onFilterChange }) => {
  const [uniqueSpecies, setUniqueSpecies] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {isExpanded ? (
        <StyledFilterPanel className="filter-panel">
          <Typography variant="subtitle1" color="primary" fontWeight="medium" gutterBottom className="filter-header">
            Filtrera efter arter
          </Typography>
          
          <Tooltip title="Minimera panel">
            <MinimizeButton 
              onClick={toggleExpanded} 
              size="small" 
              color="primary"
              aria-label="minimize panel"
            >
              <KeyboardArrowRightIcon fontSize="small" />
            </MinimizeButton>
          </Tooltip>
          
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
      ) : (
        <CollapsedPanel>
          <Tooltip title="Expandera panel">
            <IconButton 
              onClick={toggleExpanded} 
              size="small" 
              color="primary"
              aria-label="expand panel"
            >
              <KeyboardArrowLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {selectedSpecies.size > 0 && (
            <Box ml={1}>
              <Typography variant="caption" color="primary">
                {selectedSpecies.size} filter aktiva
              </Typography>
            </Box>
          )}
        </CollapsedPanel>
      )}
    </>
  );
};

export default SpeciesFilter;
