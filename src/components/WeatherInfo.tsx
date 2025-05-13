import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import { WeatherData, fetchWeatherData } from '../utils/WeatherService';

// Weather icons
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';

interface WeatherInfoProps {
  selectedLake: GeoJsonFeature;
}

const WeatherInfo: React.FC<WeatherInfoProps> = ({ selectedLake }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchWeatherData(selectedLake);
        
        if (data.errorMessage) {
          setError(data.errorMessage);
        } else {
          setWeatherData(data);
        }
      } catch (err) {
        setError('Kunde inte hämta väderdata. Försök igen senare.');
        console.error('Error fetching weather data:', err);
      } finally {
        setLoading(false);
      }
    };

    getWeatherData();
  }, [selectedLake]);

  // Function to determine wind direction name
  const getWindDirection = (degrees?: number): string => {
    if (degrees === undefined) return 'Okänd';
    
    const directions = [
      'N', 'NNO', 'NO', 'ONO', 
      'O', 'OSO', 'SO', 'SSO', 
      'S', 'SSV', 'SV', 'VSV', 
      'V', 'VNV', 'NV', 'NNV'
    ];
    
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          Hämtar väderdata...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!weatherData) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        Ingen väderdata tillgänglig
      </Typography>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          Aktuellt väder
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {weatherData.weatherSymbol && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              {weatherData.weatherSymbol.includes('cloud') ? (
                <CloudIcon color="action" sx={{ fontSize: 40 }} />
              ) : (
                <WbSunnyIcon color="warning" sx={{ fontSize: 40 }} />
              )}
            </Box>
          )}
          <Box>
            <Typography variant="h5" component="div">
              {weatherData.temperature !== undefined ? `${weatherData.temperature}°C` : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {weatherData.weatherDescription || 'Okänd'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ThermostatIcon color="error" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Känns som
                </Typography>
                <Typography variant="body1">
                  {weatherData.feelsLike !== undefined ? `${weatherData.feelsLike}°C` : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AirIcon color="info" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Vind
                </Typography>
                <Typography variant="body1">
                  {weatherData.windSpeed !== undefined 
                    ? `${weatherData.windSpeed} m/s ${getWindDirection(weatherData.windDirection)}` 
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WaterDropIcon color="info" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Nederbörd
                </Typography>
                <Typography variant="body1">
                  {weatherData.precipitation !== undefined ? `${weatherData.precipitation} mm` : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CloudIcon color="action" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Molnighet
                </Typography>
                <Typography variant="body1">
                  {weatherData.cloudCover !== undefined ? `${weatherData.cloudCover}%` : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
          Källa: MET Norway
        </Typography>
      </CardContent>
    </Card>
  );
};

export default WeatherInfo;