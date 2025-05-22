import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { WeatherForecastItem } from '../types/WeatherTypes';
import { fetchWeatherData, getWeatherIconUrl, formatTime } from '../utils/weatherService';

interface WeatherForecastProps {
  latitude: number;
  longitude: number;
  lakeName: string;
}

const WeatherCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5),
}));

const WeatherIcon = styled('img')({
  width: 40,
  height: 40,
  objectFit: 'contain',
});

const WeatherForecast: React.FC<WeatherForecastProps> = ({ latitude, longitude, lakeName }) => {
  const [weather, setWeather] = useState<WeatherForecastItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        const weatherData = await fetchWeatherData(latitude, longitude);
        setWeather(weatherData);
      } catch (err) {
        setError('Kunde inte hämta väderdata');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, [latitude, longitude]);

  if (loading) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Väderprognos
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Väderprognos
        </Typography>
        <Alert severity="warning" sx={{ mt: 1 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const currentWeather = weather[0];

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Väderprognos för {lakeName}
      </Typography>
      
      {currentWeather && (
        <Box sx={{ mb: 2 }}>
          <WeatherCard>
            <CardContent sx={{ py: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <WeatherIcon 
                    src={getWeatherIconUrl(currentWeather.symbolCode)} 
                    alt="Weather icon"
                  />
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="h4" component="span" color="primary">
                    {currentWeather.temperature}°C
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`💨 ${currentWeather.windSpeed} km/h`} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={`💧 ${currentWeather.humidity}%`} 
                      size="small" 
                      variant="outlined" 
                    />
                    {currentWeather.precipitation > 0 && (
                      <Chip 
                        label={`🌧️ ${currentWeather.precipitation.toFixed(1)} mm`} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </WeatherCard>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        48-timmarsprognos
      </Typography>
      
      <Grid container spacing={1}>
        {weather.slice(1).map((item, index) => (
          <Grid item xs={6} key={index}>
            <WeatherCard>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {formatTime(item.time)}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {item.temperature}°C
                    </Typography>
                    {item.precipitation > 0 && (
                      <Typography variant="caption" display="block" color="info.main">
                        {item.precipitation.toFixed(1)} mm
                      </Typography>
                    )}
                  </Box>
                  <WeatherIcon 
                    src={getWeatherIconUrl(item.symbolCode)} 
                    alt="Weather icon"
                  />
                </Box>
              </CardContent>
            </WeatherCard>
          </Grid>
        ))}
      </Grid>
      
      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        Data från yr.no, levererat av Meteorologisk institutt
      </Typography>
    </Box>
  );
};

export default WeatherForecast;