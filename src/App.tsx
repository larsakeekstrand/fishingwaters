import React, { useEffect, useState, useRef } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography
} from '@mui/material';
import Map, { MapRef } from './components/Map';
import SidePanel from './components/SidePanel';
import FloatingSearchBar from './components/FloatingSearchBar';
import FloatingActionButtons from './components/FloatingActionButtons';
import { GeoJsonCollection, GeoJsonFeature } from './types/GeoJsonTypes';
import { mergeGeoJsonCollections, removeBOM, convertLakeDataToGeoJson } from './utils/DataLoader';
import { calculateDistance } from './utils/geoUtils';

export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '') || '/fishingwaters';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
  },
  components: {
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [data, setData] = useState<GeoJsonCollection>({ type: 'FeatureCollection', features: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredSpecies, setFilteredSpecies] = useState<Set<string>>(new Set());
  const [selectedLake, setSelectedLake] = useState<GeoJsonFeature | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState<boolean>(false);
  const [radiusFilter, setRadiusFilter] = useState<{userLat: number, userLon: number, radius: number} | null>(null);
  const [showBoatRamps, setShowBoatRamps] = useState<boolean>(false);

  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    fetchAllLakeData();
  }, []);

  const fetchAllLakeData = async () => {
    try {
      setIsLoading(true);

      const indexResponse = await fetch(`${BASE_PATH}/data/index.json`);

      let fileList: string[] = [];

      if (indexResponse.ok) {
        try {
          const responseText = await indexResponse.text();
          const indexData = JSON.parse(responseText);
          fileList = indexData.files || [];
        } catch (jsonError) {
          console.error('Error parsing index.json:', jsonError);
          setError('Invalid JSON format in index.json');
        }
      } else {
        const errorText = await indexResponse.text();
        console.error('Failed to fetch index.json:', indexResponse.status, errorText);
        setError(`Failed to load index.json (${indexResponse.status})`);
      }

      const collections: GeoJsonCollection[] = [];

      for (const fileName of fileList) {
        if (fileName.endsWith('.json')) {
          try {
            const response = await fetch(`${BASE_PATH}/data/${fileName}`);
            if (response.ok) {
              let text = await response.text();
              text = removeBOM(text);
              const jsonData = JSON.parse(text);

             if (Array.isArray(jsonData)) {
                try {
                  const convertedData = convertLakeDataToGeoJson(jsonData);
                  collections.push(convertedData);
                } catch (conversionError) {
                  console.error(`Error converting ${fileName} to GeoJSON:`, conversionError);
                }
              }
            }
          } catch (err) {
            console.error(`Error processing file ${fileName}:`, err);
          }
        }
      }

      const mergedData = mergeGeoJsonCollections(collections);
      setData(mergedData);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching lake data:', err);
      setError('Failed to load lake data. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleFilterChange = (selectedSpecies: Set<string>) => {
    setFilteredSpecies(selectedSpecies);

    if (selectedSpecies.size > 0) {
      const matchingLakes = data.features.filter(feature => {
        const hasAny = (species: string[] | string | undefined): boolean => {
          if (!species) return false;
          if (Array.isArray(species)) return species.some(s => selectedSpecies.has(s));
          if (typeof species === 'string') {
            if (species.includes(',')) return species.split(',').map(s => s.trim()).some(s => selectedSpecies.has(s));
            return selectedSpecies.has(species);
          }
          return false;
        };
        return hasAny(feature.properties.catchedSpecies) || hasAny(feature.properties.fångadeArter);
      });
      mapRef.current?.ensureVisible(matchingLakes);
    }
  };

  const handleLakeSelect = (lake: GeoJsonFeature) => {
    setSelectedLake(lake);
    setSidePanelOpen(true);
  };

  const handleSearchSelect = (lake: GeoJsonFeature) => {
    setSelectedLake(lake);
    mapRef.current?.focusOnLake(lake);
    setSidePanelOpen(true);
  };

  const handleRadiusSearch = (userLat: number, userLon: number, radius: number) => {
    setRadiusFilter({ userLat, userLon, radius });
    setFilteredSpecies(new Set());
    setSelectedLake(null);

    const lakesInRadius = data.features.filter(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      return calculateDistance(userLat, userLon, lat, lng) <= radius;
    });
    mapRef.current?.fitToLakes(lakesInRadius);
  };

  const handleSidePanelClose = () => {
    setSidePanelOpen(false);
  };

  const handleReset = () => {
    setSelectedLake(null);
    setSidePanelOpen(false);
    setFilteredSpecies(new Set());
    setRadiusFilter(null);
  };

  const hasActiveFilters = selectedLake !== null || filteredSpecies.size > 0 || radiusFilter !== null;

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
        >
          <Typography variant="h6" color="text.secondary">
            Laddar sjödata...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
        >
          <Typography variant="h6" color="error">
            {error || 'Det gick inte att ladda sjödata. Försök igen senare.'}
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Full-viewport map */}
      <Box sx={{ position: 'fixed', inset: 0 }}>
        <Map
          ref={mapRef}
          data={data}
          filteredSpecies={filteredSpecies}
          selectedLake={selectedLake}
          onLakeSelect={handleLakeSelect}
          radiusFilter={radiusFilter}
          showBoatRamps={showBoatRamps}
        />
      </Box>

      {/* Overlay container for floating elements */}
      <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1000 }}>
        <FloatingSearchBar
          lakes={data.features}
          onLakeSelect={handleSearchSelect}
        />

        <FloatingActionButtons
          features={data.features}
          onFilterChange={handleFilterChange}
          selectedSpecies={filteredSpecies}
          onRadiusSearch={handleRadiusSearch}
          showBoatRamps={showBoatRamps}
          onBoatRampsToggle={setShowBoatRamps}
          onReset={handleReset}
          hasActiveFilters={hasActiveFilters}
        />

        <SidePanel
          selectedLake={selectedLake}
          open={sidePanelOpen}
          onClose={handleSidePanelClose}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
