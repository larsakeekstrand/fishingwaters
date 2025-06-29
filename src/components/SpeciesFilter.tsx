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
  Collapse,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
  Backdrop
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface SpeciesFilterProps {
  features: GeoJsonFeature[];
  onFilterChange: (selectedSpecies: Set<string>) => void;
}

const StyledFilterPanel = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isMinimized'
})<{ isMinimized: boolean }>(({ theme, isMinimized }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: isMinimized ? theme.spacing(1.5) : theme.spacing(2),
  zIndex: 1000,
  maxHeight: '80vh',
  overflow: 'auto',
  width: isMinimized ? 'auto' : 250,
  minWidth: isMinimized ? 120 : 'auto',
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['width', 'padding'], {
    duration: theme.transitions.duration.standard,
  }),
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}));

const MobileFilterButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  zIndex: 1200,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  [theme.breakpoints.up('md')]: {
    display: 'none'
  }
}));

const DrawerPuller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.grey[300],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

const SpeciesFilter: React.FC<SpeciesFilterProps> = ({ features, onFilterChange }) => {
  const [uniqueSpecies, setUniqueSpecies] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const filterContent = (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 2 }}>
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
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <MobileFilterButton
          onClick={() => setMobileOpen(true)}
          size="large"
        >
          <FilterListIcon />
        </MobileFilterButton>
        
        <SwipeableDrawer
          anchor="bottom"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpen={() => setMobileOpen(true)}
          disableSwipeToOpen={false}
          PaperProps={{
            sx: {
              height: '70vh',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              overflow: 'visible'
            }
          }}
        >
          <DrawerPuller />
          <Box sx={{ p: 3, pt: 4 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" color="primary">
                Filtrera efter arter
              </Typography>
              <IconButton onClick={() => setMobileOpen(false)} size="small">
                <ExpandLessIcon />
              </IconButton>
            </Box>
            {filterContent}
          </Box>
        </SwipeableDrawer>
        
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer - 1 }}
          open={mobileOpen}
          onClick={() => setMobileOpen(false)}
        />
      </>
    );
  }

  return (
    <StyledFilterPanel className="filter-panel" isMinimized={isMinimized}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography 
          variant="subtitle1" 
          color="primary" 
          fontWeight="medium" 
          className="filter-header"
          sx={{ 
            fontSize: isMinimized ? '0.875rem' : '1rem',
            transition: 'font-size 0.3s ease'
          }}
        >
          {isMinimized ? 'Filter' : 'Filtrera efter arter'}
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => setIsMinimized(!isMinimized)}
          sx={{ ml: 1 }}
        >
          {isMinimized ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={!isMinimized}>
        {filterContent}
      </Collapse>
    </StyledFilterPanel>
  );
};

export default SpeciesFilter;
