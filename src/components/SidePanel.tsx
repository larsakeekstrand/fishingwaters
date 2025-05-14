import React, { useEffect, useState } from 'react';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Icon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchWeatherData, WeatherInfo, getWeatherIcon } from '../utils/weatherService';

interface SidePanelProps {
  selectedLake: GeoJsonFeature | null;
}

const StyledSidePanel = styled(Paper)(({ theme }) => ({
  width: 300,
  padding: theme.spacing(3),
  height: '100vh',
  overflow: 'auto',
  boxShadow: theme.shadows[3],
  zIndex: 1000,
  position: 'relative'
}));

const WeatherCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText
}));

const WeatherContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2)
}));

const WeatherRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: theme.spacing(1)
}));

const SidePanel: React.FC<SidePanelProps> = ({ selectedLake }) => {
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  useEffect(() => {
    async function getWeatherData() {
      if (selectedLake) {
        setIsLoadingWeather(true);
        try {
          const data = await fetchWeatherData(selectedLake);
          setWeatherInfo(data);
        } catch (error) {
          console.error('Error fetching weather data:', error);
          setWeatherInfo(null);
        } finally {
          setIsLoadingWeather(false);
        }
      } else {
        setWeatherInfo(null);
      }
    }

    getWeatherData();
  }, [selectedLake]);

  if (!selectedLake) {
    return (
      <StyledSidePanel>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body1" color="text.secondary">
            Välj en sjö på kartan för att se mer information
          </Typography>
        </Box>
      </StyledSidePanel>
    );
  }

  const renderCaughtSpecies = (species: string[] | string | undefined): string => {
    if (!species) return 'Inga rapporterade';
    if (Array.isArray(species)) return species.join(', ');
    return species;
  };

  return (
    <StyledSidePanel>
      <Typography variant="h5" component="h2" gutterBottom color="primary">
        {selectedLake.properties.name}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {/* Weather Card */}
      <WeatherCard>
        <WeatherContent>
          <Typography variant="h6" component="div" gutterBottom>
            Väder
          </Typography>
          
          {isLoadingWeather ? (
            <CircularProgress size={40} color="inherit" />
          ) : weatherInfo ? (
            <>
              <Box display="flex" alignItems="center" mb={1}>
                <Icon sx={{ fontSize: 40, mr: 1 }}>{getWeatherIcon(weatherInfo.symbolCode)}</Icon>
                <Typography variant="h4">{Math.round(weatherInfo.temperature)}°C</Typography>
              </Box>
              
              <Typography variant="caption" sx={{ mb: 2 }}>
                {weatherInfo.time}
              </Typography>
              
              <WeatherRow>
                <Typography variant="body2">Vind:</Typography>
                <Typography variant="body2">{weatherInfo.windSpeed} m/s</Typography>
              </WeatherRow>
              
              <WeatherRow>
                <Typography variant="body2">Luftfuktighet:</Typography>
                <Typography variant="body2">{weatherInfo.humidity}%</Typography>
              </WeatherRow>
              
              <WeatherRow>
                <Typography variant="body2">Nederbörd:</Typography>
                <Typography variant="body2">{weatherInfo.precipitation} mm</Typography>
              </WeatherRow>
            </>
          ) : (
            <Typography variant="body2">
              Väderinformation kunde inte hämtas
            </Typography>
          )}
        </WeatherContent>
      </WeatherCard>
      
      <List disablePadding>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Maxdjup" 
            secondary={selectedLake.properties.maxDepth !== null ? `${selectedLake.properties.maxDepth} m` : 'Okänt'} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Area" 
            secondary={selectedLake.properties.area !== null && selectedLake.properties.area !== undefined
              ? `${selectedLake.properties.area.toLocaleString()} ha`
              : 'Okänd'} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Län" 
            secondary={selectedLake.properties.county} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Fångade arter" 
            secondary={renderCaughtSpecies(selectedLake.properties.catchedSpecies || selectedLake.properties.fångadeArter)} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Vanligaste art" 
            secondary={selectedLake.properties.vanlArt
              ? `${selectedLake.properties.vanlArt} (${selectedLake.properties.vanlArtWProc}%)`
              : 'Okänd'} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Näst vanligaste art" 
            secondary={selectedLake.properties.nästVanlArt
              ? `${selectedLake.properties.nästVanlArt} (${selectedLake.properties.nästVanlArtWProc}%)`
              : 'Okänd'} 
          />
        </ListItem>
        <ListItem sx={{ py: 1 }}>
          <ListItemText 
            primary="Senaste fiskeår" 
            secondary={selectedLake.properties.senasteFiskeår || 'Okänt'} 
          />
        </ListItem>
      </List>
    </StyledSidePanel>
  );
};

export default SidePanel;
