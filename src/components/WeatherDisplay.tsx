import React from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Paper,
  Grid
} from '@mui/material';
import { useWeather } from '../utils/WeatherService';

interface WeatherDisplayProps {
  latitude: number | null;
  longitude: number | null;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ latitude, longitude }) => {
  const { weatherData, isLoading, error } = useWeather(latitude, longitude);

  if (!latitude || !longitude) {
    return null;
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2" align="center">
        {error.message}
      </Typography>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <Paper elevation={0} sx={{ mb: 2, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
      <Typography variant="h6" gutterBottom>
        Aktuellt väder
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box display="flex" alignItems="center">
            <Box mr={1}>
              <img 
                src={`https://api.met.no/images/weathericons/svg/${weatherData.weatherSymbol}.svg`}
                alt={weatherData.weatherDescription}
                style={{ width: 40, height: 40 }}
              />
            </Box>
            <Box>
              <Typography variant="body1">
                {weatherData.temperature.toFixed(1)}°C
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {weatherData.weatherDescription}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Vind:</strong> {weatherData.windSpeed.toFixed(1)} m/s
          </Typography>
          <Typography variant="body2">
            <strong>Luftfuktighet:</strong> {weatherData.humidity.toFixed(0)}%
          </Typography>
          <Typography variant="body2">
            <strong>Nederbörd:</strong> {weatherData.precipitation.toFixed(1)} mm
          </Typography>
        </Grid>
      </Grid>
      
      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
        Källa: api.met.no | Uppdaterad: {new Date(weatherData.lastUpdated).toLocaleTimeString()}
      </Typography>
    </Paper>
  );
};

export default WeatherDisplay;