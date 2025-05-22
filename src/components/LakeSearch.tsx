import React, { useState, useEffect } from 'react';
import { 
  Paper,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface LakeSearchProps {
  features: GeoJsonFeature[];
  onLakeSelect: (lake: GeoJsonFeature) => void;
}

const StyledSearchPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1001,
  width: 250,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  }
}));

const LakeSearch: React.FC<LakeSearchProps> = ({ features, onLakeSelect }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<GeoJsonFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filteredLakes = features
      .filter(feature => 
        feature.properties.name && 
        feature.properties.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5); // Limit to 5 suggestions

    setSuggestions(filteredLakes);
    setShowSuggestions(filteredLakes.length > 0);
  }, [searchTerm, features]);

  const handleLakeSelect = (lake: GeoJsonFeature) => {
    setSearchTerm(lake.properties.name || '');
    setShowSuggestions(false);
    onLakeSelect(lake);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <StyledSearchPanel>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" color="primary" fontWeight="medium" gutterBottom>
          Sök sjö
        </Typography>
        
        <StyledTextField
          fullWidth
          size="small"
          placeholder="Skriv sjönamn..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          variant="outlined"
        />
        
        {showSuggestions && (
          <Paper 
            elevation={2} 
            sx={{ 
              mt: 1, 
              maxHeight: 200, 
              overflow: 'auto',
              borderRadius: 1
            }}
          >
            <List dense disablePadding>
              {suggestions.map((lake, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => handleLakeSelect(lake)}
                    sx={{ 
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        opacity: 0.1
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="medium">
                          {lake.properties.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {lake.properties.county}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </StyledSearchPanel>
  );
};

export default LakeSearch;