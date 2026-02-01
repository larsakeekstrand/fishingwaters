import React, { useEffect, useState } from 'react';
import {
  SwipeableDrawer,
  Box,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  Divider,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface SpeciesFilterSheetProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  features: GeoJsonFeature[];
  onFilterChange: (selectedSpecies: Set<string>) => void;
  selectedSpecies: Set<string>;
}

const SpeciesFilterSheet: React.FC<SpeciesFilterSheetProps> = ({
  open,
  onClose,
  onOpen,
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
    onFilterChange(new Set(uniqueSpecies));
  };

  const handleClearAll = () => {
    onFilterChange(new Set());
  };

  const filteredSpecies = uniqueSpecies.filter(species =>
    species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          height: '85vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'visible',
        },
      }}
    >
      {/* Drag handle */}
      <Box
        sx={{
          width: 32,
          height: 4,
          bgcolor: 'grey.300',
          borderRadius: 2,
          mx: 'auto',
          mt: 1,
          mb: 0.5,
        }}
      />

      <Box sx={{ px: 2, pb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
          <Typography variant="subtitle1">
            Filtrera efter arter
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
          {/* Search */}
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
              },
            }}
          />

          {/* Select all / Clear all */}
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={handleSelectAll} fullWidth>
              Välj alla
            </Button>
            <Button size="small" variant="outlined" onClick={handleClearAll} fullWidth color="secondary">
              Rensa alla
            </Button>
          </Stack>

          <Divider />

          {/* Scrollable checkbox list */}
          <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
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
                        size="medium"
                        color="primary"
                      />
                    }
                    label={species}
                    sx={{ py: 0.5 }}
                  />
                ))
              )}
            </FormGroup>
          </Box>

          {/* Footer count */}
          <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              {selectedSpecies.size} av {uniqueSpecies.length} valda
            </Typography>
          </Box>
        </Stack>
      </Box>
    </SwipeableDrawer>
  );
};

export default SpeciesFilterSheet;
