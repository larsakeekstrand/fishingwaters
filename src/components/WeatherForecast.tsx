import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface WeatherForecastProps {
  latitude: number;
  longitude: number;
}

interface WeatherData {
  time: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  symbol: string;
}

interface ForecastPeriod {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_speed: number;
        wind_from_direction: number;
      };
    };
    next_1_hours?: {
      summary: {
        symbol_code: string;
      };
      details: {
        precipitation_amount: number;
      };
    };
    next_6_hours?: {
      summary: {
        symbol_code: string;
      };
      details: {
        precipitation_amount: number;
      };
    };
  };
}

const WeatherCard = styled(Card)(({ theme }) => ({
  minWidth: 120,
  margin: theme.spacing(0.5),
  textAlign: 'center',
  background: 'linear-gradient(145deg, #f0f8ff, #e6f3ff)',
  border: '1px solid #cce7ff'
}));

const WeatherIcon = styled('img')({
  width: 40,
  height: 40,
  margin: '0 auto'
});

const WeatherForecast: React.FC<WeatherForecastProps> = ({ latitude, longitude }) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'FishingWaters/1.0 (github.com/larsakeekstrand/fishingwaters)'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      const forecast = processWeatherData(data.properties.timeseries);
      setWeatherData(forecast);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Kunde inte hämta väderprognos');
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const processWeatherData = (timeseries: ForecastPeriod[]): WeatherData[] => {
    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    return timeseries
      .filter(period => {
        const periodTime = new Date(period.time);
        return periodTime >= now && periodTime <= next48Hours;
      })
      .slice(0, 16) // Limit to 16 periods (every 3 hours for 48 hours)
      .map(period => ({
        time: period.time,
        temperature: Math.round(period.data.instant.details.air_temperature),
        precipitation: period.data.next_1_hours?.details.precipitation_amount || 
                      period.data.next_6_hours?.details.precipitation_amount || 0,
        windSpeed: Math.round(period.data.instant.details.wind_speed),
        windDirection: period.data.instant.details.wind_from_direction,
        symbol: period.data.next_1_hours?.summary.symbol_code || 
                period.data.next_6_hours?.summary.symbol_code || 'clearsky_day'
      }));
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    const timeFormat = date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    if (isToday) return `Idag ${timeFormat}`;
    if (isTomorrow) return `Imorgon ${timeFormat}`;
    return `${date.toLocaleDateString('sv-SE', { 
      month: 'short', 
      day: 'numeric' 
    })} ${timeFormat}`;
  };

  const getWeatherIcon = (symbolCode: string): string => {
    // Use yr.no weather icons hosted on met.no
    return `https://api.met.no/images/weathericons/svg/${symbolCode}.svg`;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Hämtar väderprognos...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (weatherData.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Väderprognos (48h)
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 300, overflow: 'auto' }}>
        {weatherData.map((weather, index) => (
          <WeatherCard key={index} variant="outlined">
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={6}>
                  <Typography variant="caption" display="block">
                    {formatTime(weather.time)}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <WeatherIcon 
                    src={getWeatherIcon(weather.symbol)}
                    alt="Weather icon"
                    onError={(e) => {
                      // Fallback to a simple icon if the SVG fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" fontWeight="bold">
                    {weather.temperature}°C
                  </Typography>
                </Grid>
              </Grid>
              
              <Grid container spacing={0.5} sx={{ mt: 0.5 }}>
                {weather.precipitation > 0 && (
                  <Grid item>
                    <Chip 
                      label={`${weather.precipitation}mm`} 
                      size="small" 
                      color="info"
                      sx={{ fontSize: '0.7rem', height: 18 }}
                    />
                  </Grid>
                )}
                <Grid item>
                  <Chip 
                    label={`${weather.windSpeed} m/s ${getWindDirection(weather.windDirection)}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 18 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </WeatherCard>
        ))}
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Väderdata från MET Norway
      </Typography>
    </Box>
  );
};

export default WeatherForecast;