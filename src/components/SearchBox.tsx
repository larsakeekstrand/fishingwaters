import React, { useState, useEffect, useRef } from 'react';
import { 
  Paper, 
  InputBase, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ClickAwayListener, 
  Typography,
  Popper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PlaceIcon from '@mui/icons-material/Place';
import { styled } from '@mui/material/styles';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface SearchBoxProps {
  features: GeoJsonFeature[];
  onLakeSelect: (lake: GeoJsonFeature) => void;
}

const StyledSearchContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1200,
  width: 'min(90%, 500px)',
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  display: 'flex',
  alignItems: 'center',
}));

const StyledSuggestionsContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxHeight: '60vh',
  overflow: 'auto',
  zIndex: 1300,
  boxShadow: theme.shadows[4],
  marginTop: theme.spacing(0.5),
}));

const NoResultsText = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
  textAlign: 'center',
}));

const SearchBox: React.FC<SearchBoxProps> = ({ features, onLakeSelect }) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<GeoJsonFeature[]>([]);
  const [isPopperOpen, setIsPopperOpen] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Update suggestions when search text changes
  useEffect(() => {
    if (searchText.trim() === '') {
      setSuggestions([]);
      setIsPopperOpen(false);
      return;
    }

    const searchTerms = searchText.toLowerCase().trim().split(/\s+/);
    
    // Filter features based on search text
    const filteredFeatures = features.filter(feature => {
      const lakeName = feature.properties.name?.toLowerCase() || '';
      const countyName = feature.properties.county?.toLowerCase() || '';
      
      // Check if all search terms are found in either lake name or county
      return searchTerms.every(term => 
        lakeName.includes(term) || countyName.includes(term)
      );
    });
    
    // Sort results - exact matches first, then starts with, then includes
    const sortedFeatures = [...filteredFeatures].sort((a, b) => {
      const nameA = a.properties.name?.toLowerCase() || '';
      const nameB = b.properties.name?.toLowerCase() || '';
      
      // Exact match
      if (nameA === searchText.toLowerCase()) return -1;
      if (nameB === searchText.toLowerCase()) return 1;
      
      // Starts with
      if (nameA.startsWith(searchText.toLowerCase()) && !nameB.startsWith(searchText.toLowerCase())) return -1;
      if (nameB.startsWith(searchText.toLowerCase()) && !nameA.startsWith(searchText.toLowerCase())) return 1;
      
      // Alphabetical
      return nameA.localeCompare(nameB);
    });
    
    setSuggestions(sortedFeatures.slice(0, 10)); // Limit to 10 suggestions
    setIsPopperOpen(true);
  }, [searchText, features]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setAnchorEl(event.currentTarget);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSuggestions([]);
    setIsPopperOpen(false);
  };

  const handleLakeSelect = (lake: GeoJsonFeature) => {
    onLakeSelect(lake);
    setSearchText(lake.properties.name || '');
    setIsPopperOpen(false);
  };

  const handleClickAway = () => {
    setIsPopperOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div>
        <StyledSearchContainer ref={searchInputRef}>
          <IconButton aria-label="search" disabled>
            <SearchIcon />
          </IconButton>
          <InputBase
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Sök efter sjöar..."
            fullWidth
            autoComplete="off"
            sx={{ ml: 1 }}
          />
          {searchText && (
            <IconButton aria-label="clear search" onClick={handleClearSearch} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </StyledSearchContainer>

        <Popper
          open={isPopperOpen && suggestions.length > 0}
          anchorEl={anchorEl || searchInputRef.current}
          placement="bottom-start"
          style={{ width: searchInputRef.current?.offsetWidth, zIndex: 1300 }}
        >
          <StyledSuggestionsContainer>
            <List dense disablePadding>
              {suggestions.length > 0 ? (
                suggestions.map((lake, index) => (
                  <ListItem 
                    key={index} 
                    onClick={() => handleLakeSelect(lake)}
                    divider={index < suggestions.length - 1}
                    sx={{ cursor: 'pointer' }}
                  >
                    <PlaceIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText 
                      primary={lake.properties.name} 
                      secondary={lake.properties.county}
                    />
                  </ListItem>
                ))
              ) : (
                <NoResultsText variant="body2">
                  Inga sjöar hittades
                </NoResultsText>
              )}
            </List>
          </StyledSuggestionsContainer>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default SearchBox;