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
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

interface SpeciesFilterProps {
  features: GeoJsonFeature[];
  onFilterChange: (selectedSpecies: Set<string>) => void;
}

interface StyledFilterPanelProps {
  minimized: boolean;
}

const StyledFilterPanel = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'minimized'
})<StyledFilterPanelProps>(({ theme, minimized }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(2),
  zIndex: 1000,
  maxHeight: '80vh',
  overflow: 'auto',
  width: minimized ? 'auto' : 250,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['width', 'transform'], {
    duration: theme.transitions.duration.standard,
  })
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

  return (
    <StyledFilterPanel className="filter-panel" minimized={minimized}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        {!minimized && (
          <Typography variant="subtitle1" color="primary" fontWeight="medium" className="filter-header">
            Filtrera efter arter
          </Typography>
        )}
        <Tooltip title={minimized ? "Expandera" : "Minimera"}>
          <IconButton 
            color="primary" 
            onClick={() => setMinimized(!minimized)}
            size="small"
            sx={{ ml: minimized ? 0 : 1 }}
          >
            {minimized ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      
      {!minimized && (
        <>
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
        </>
      )}
    </StyledFilterPanel>
  );
};

export default SpeciesFilter;
