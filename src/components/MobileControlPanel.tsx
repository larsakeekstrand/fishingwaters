import React, { useState, useEffect } from 'react';
import {
  SwipeableDrawer,
  Box,
  Typography,
  Tabs,
  Tab,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  TextField,
  IconButton,
  Chip,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import AnchorIcon from '@mui/icons-material/Anchor';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import CloseIcon from '@mui/icons-material/Close';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface MobileControlPanelProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  features: GeoJsonFeature[];
  onFilterChange: (species: Set<string>) => void;
  selectedSpecies: Set<string>;
  showBoatRamps: boolean;
  onBoatRampsToggle: (show: boolean) => void;
  onRadiusSearch: (lat: number, lon: number, radius: number) => void;
}

const DrawerPuller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.grey[300],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({ 
  children, 
  value, 
  index 
}) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ 
        height: 'calc(100% - 48px)', 
        overflow: 'auto',
        p: 2
      }}
    >
      {value === index && children}
    </Box>
  );
};

const MobileControlPanel: React.FC<MobileControlPanelProps> = ({
  open,
  onClose,
  onOpen,
  features,
  onFilterChange,
  selectedSpecies,
  showBoatRamps,
  onBoatRampsToggle,
  onRadiusSearch
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [uniqueSpecies, setUniqueSpecies] = useState<string[]>([]);
  const [radius, setRadius] = useState<string>('10');
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

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

  const getUserLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          alert('Kunde inte hämta din position.');
        }
      );
    } else {
      alert('Platshämtning stöds inte i din webbläsare.');
      setIsGettingLocation(false);
    }
  };

  const handleRadiusSearchClick = () => {
    if (userLocation) {
      const radiusNum = parseFloat(radius);
      if (!isNaN(radiusNum) && radiusNum > 0) {
        onRadiusSearch(userLocation.lat, userLocation.lon, radiusNum);
        onClose();
      }
    }
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen={false}
      PaperProps={{
        sx: {
          height: '70vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'visible'
        }
      }}
    >
      <DrawerPuller />
      
      <Box sx={{ pt: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Kontroller</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Filter" 
            icon={<FilterListIcon />} 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            label="Närliggande" 
            icon={<GpsFixedIcon />} 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            label="Inställningar" 
            icon={<AnchorIcon />} 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
        </Tabs>

        {/* Filter Tab */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1">
                Filtrera efter arter
                {selectedSpecies.size > 0 && (
                  <Chip 
                    label={selectedSpecies.size} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
            
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
            
            <Box sx={{ maxHeight: '40vh', overflow: 'auto' }}>
              <FormGroup>
                {uniqueSpecies.map(species => (
                  <FormControlLabel
                    key={species}
                    control={
                      <Checkbox
                        checked={selectedSpecies.has(species)}
                        onChange={(e) => handleCheckboxChange(species, e.target.checked)}
                        size="medium"
                        color="primary"
                      />
                    }
                    label={species}
                    sx={{ 
                      py: 0.5,
                      '& .MuiFormControlLabel-label': { fontSize: '0.95rem' }
                    }}
                  />
                ))}
              </FormGroup>
            </Box>
          </Stack>
        </TabPanel>

        {/* Location Tab */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={3}>
            <Typography variant="subtitle1">
              Sök sjöar inom radie från din position
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={getUserLocation}
              disabled={isGettingLocation}
              startIcon={<GpsFixedIcon />}
            >
              {isGettingLocation ? 'Hämtar position...' : 
               userLocation ? 'Uppdatera position' : 'Hämta min position'}
            </Button>
            
            {userLocation && (
              <>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'grey.100', 
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <Typography variant="caption" color="text.secondary">
                    Din position
                  </Typography>
                  <Typography variant="body2">
                    {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                  </Typography>
                </Box>
                
                <TextField
                  fullWidth
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  label="Sökradie"
                  slotProps={{
                    htmlInput: { min: 1, max: 500 },
                    input: {
                      endAdornment: <InputAdornment position="end">km</InputAdornment>
                    }
                  }}
                />
                
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleRadiusSearchClick}
                  color="primary"
                >
                  Sök sjöar
                </Button>
              </>
            )}
          </Stack>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <List>
            <ListItem>
              <ListItemIcon>
                <AnchorIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Visa båtramper"
                secondary="Visar båtramper på kartan"
              />
              <Switch
                edge="end"
                checked={showBoatRamps}
                onChange={(e) => onBoatRampsToggle(e.target.checked)}
              />
            </ListItem>
          </List>
        </TabPanel>
      </Box>
    </SwipeableDrawer>
  );
};

export default MobileControlPanel;