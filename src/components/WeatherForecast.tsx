import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  fetchWeatherForecast,
  getWeatherIcon,
  formatTime,
  formatDate,
  WeatherForecast as WeatherForecastType,
  WeatherData,
} from '../utils/weatherService';

interface WeatherForecastProps {
  latitude: number;
  longitude: number;
  lakeName: string;
}

const WeatherCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
}));

const WeatherItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const WeatherIcon = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  marginRight: theme.spacing(1),
  minWidth: '2rem',
  textAlign: 'center',
}));

const WeatherForecast: React.FC<WeatherForecastProps> = ({ 
  latitude, 
  longitude, 
  lakeName 
}) => {
  const [forecast, setForecast] = useState<WeatherForecastType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeatherForecast = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const forecastData = await fetchWeatherForecast(latitude, longitude);
        setForecast(forecastData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Något gick fel');
      } finally {
        setLoading(false);
      }
    };

    loadWeatherForecast();
  }, [latitude, longitude]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Hämtar väderprognos...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!forecast || forecast.forecast.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Ingen väderprognos tillgänglig
      </Alert>
    );
  }

  // Group forecast by day (first 48 hours)
  const groupedForecast: { [key: string]: WeatherData[] } = {};
  forecast.forecast.slice(0, 48).forEach((weather) => {
    const date = formatDate(weather.time);
    if (!groupedForecast[date]) {
      groupedForecast[date] = [];
    }
    groupedForecast[date].push(weather);
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">
        Väderprognos - 48h
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        {lakeName}
      </Typography>
      
      {Object.entries(groupedForecast).map(([date, weatherList], dayIndex) => (
        <WeatherCard key={date} elevation={1}>
          <CardContent sx={{ pb: 1 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              {date}
            </Typography>
            
            {weatherList.slice(0, 8).map((weather, index) => (
              <WeatherItem key={index}>
                <Typography variant="body2" sx={{ minWidth: '3rem', mr: 2 }}>
                  {formatTime(weather.time)}
                </Typography>
                
                <WeatherIcon>
                  {getWeatherIcon(weather.symbol)}
                </WeatherIcon>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {weather.temperature}°C
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {weather.precipitation > 0 && `${weather.precipitation}mm `}
                    {weather.windSpeed}m/s
                  </Typography>
                </Box>
              </WeatherItem>
            ))}
          </CardContent>
        </WeatherCard>
      ))}
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Data från met.no
      </Typography>
    </Box>
  );
};

export default WeatherForecast;