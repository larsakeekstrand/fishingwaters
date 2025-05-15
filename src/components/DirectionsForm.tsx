import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  InputAdornment 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DirectionsIcon from '@mui/icons-material/Directions';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface DirectionsFormProps {
  destinationCoords: [number, number] | null; // [longitude, latitude]
  destinationName: string | null;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const DirectionsForm: React.FC<DirectionsFormProps> = ({ 
  destinationCoords, 
  destinationName 
}) => {
  const [origin, setOrigin] = useState<string>('');

  // Function to handle opening Google Maps directions
  const handleGetDirections = () => {
    if (!destinationCoords) return;
    
    // Google Maps expects coordinates in "latitude,longitude" format
    const destination = `${destinationCoords[1]},${destinationCoords[0]}`;
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDestination = encodeURIComponent(destination);
    
    // Open Google Maps in a new tab with directions
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}`,
      '_blank'
    );
  };

  // Don't render if no destination is selected
  if (!destinationCoords || !destinationName) return null;

  return (
    <StyledPaper elevation={2}>
      <Typography variant="subtitle1" gutterBottom>
        Hitta vägen till {destinationName}
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <TextField
          label="Din plats"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          fullWidth
          placeholder="Ange din startpunkt"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon color="primary" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          disabled={!origin.trim()}
          onClick={handleGetDirections}
          startIcon={<DirectionsIcon />}
          size="medium"
        >
          Visa vägbeskrivning
        </Button>
      </Box>
    </StyledPaper>
  );
};

export default DirectionsForm;