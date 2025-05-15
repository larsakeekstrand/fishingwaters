import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  CircularProgress, 
  Divider,
  Grid,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Weather API types
interface WeatherData {
  properties: {
    timeseries: Array<{
      time: string;
      data: {
        instant: {
          details: {
            air_temperature: number;
            wind_speed: number;
            relative_humidity: number;
          }
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
    }>;
  };
}

interface WeatherForecastProps {
  coordinates: [number, number] | null; // [longitude, latitude]
  lakeName: string | null;
}

const WeatherSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ForecastItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '100%',
}));

const WeatherForecast: React.FC<WeatherForecastProps> = ({ coordinates, lakeName }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!coordinates) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // The Norwegian Meteorological Institute requires coordinates in lat,lon order
        const [longitude, latitude] = coordinates;
        
        // The API requires a User-Agent header with contact information
        const response = await fetch(
          `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              'User-Agent': 'FishingWaters/1.0 github.com/larsakeekstrand/fishingwaters'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Weather API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather forecast');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [coordinates]);

  if (!coordinates) {
    return null;
  }

  if (isLoading) {
    return (
      <WeatherSection>
        <Typography variant="h6" gutterBottom>Väderprognos</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      </WeatherSection>
    );
  }

  if (error) {
    return (
      <WeatherSection>
        <Typography variant="h6" gutterBottom>Väderprognos</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography color="error" variant="body2">{error}</Typography>
      </WeatherSection>
    );
  }

  if (!weatherData) {
    return null;
  }

  // Get next 3 forecasts (typically covering next 24 hours)
  const forecasts = weatherData.properties.timeseries.slice(0, 3);

  const getWeatherSymbol = (symbolCode: string) => {
    // Map symbol codes to emoji or you could use weather icons from a library
    const symbolMap: { [key: string]: string } = {
      'clearsky': '☀️',
      'fair': '🌤️',
      'partlycloudy': '⛅',
      'cloudy': '☁️',
      'rain': '🌧️',
      'heavyrain': '⛈️',
      'rainshowers': '🌦️',
      'heavyrainshowers': '⛈️',
      'lightrainshowers': '🌦️',
      'lightrain': '🌧️',
      'snow': '❄️',
      'snowshowers': '🌨️',
      'heavysnow': '❄️❄️',
      'sleet': '🌨️',
      'fog': '🌫️',
      'thunder': '⚡'
    };

    // Handle combination symbol codes (e.g., 'partlycloudy_day')
    const baseSymbol = symbolCode.split('_')[0];
    return symbolMap[baseSymbol] || symbolCode;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Format to show day and time
    return date.toLocaleString('sv-SE', { 
      weekday: 'short',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <WeatherSection>
      <Typography variant="h6" gutterBottom>
        Väderprognos {lakeName && `för ${lakeName}`}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        {forecasts.map((forecast, index) => {
          const { 
            air_temperature,
            wind_speed,
            relative_humidity
          } = forecast.data.instant.details;
          
          const symbolCode = forecast.data.next_1_hours?.summary.symbol_code || 
                             forecast.data.next_6_hours?.summary.symbol_code || 
                             'cloudy';
          
          const precipitation = forecast.data.next_1_hours?.details.precipitation_amount || 
                               forecast.data.next_6_hours?.details.precipitation_amount || 
                               0;
          
          return (
            <Grid item xs={4} key={index}>
              <ForecastItem elevation={1}>
                <Typography variant="subtitle2">{formatDate(forecast.time)}</Typography>
                <Typography variant="h3" sx={{ my: 1 }}>{getWeatherSymbol(symbolCode)}</Typography>
                <Typography variant="h6">{air_temperature.toFixed(1)}°C</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">Vind: {wind_speed.toFixed(1)} m/s</Typography>
                  <Typography variant="body2">Nederbörd: {precipitation} mm</Typography>
                  <Typography variant="body2">Luftfuktighet: {relative_humidity}%</Typography>
                </Box>
              </ForecastItem>
            </Grid>
          );
        })}
      </Grid>
    </WeatherSection>
  );
};

export default WeatherForecast;