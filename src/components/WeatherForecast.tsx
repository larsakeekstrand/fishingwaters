import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import CloudIcon from '@mui/icons-material/Cloud';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import ThermostatIcon from '@mui/icons-material/Thermostat';

interface WeatherForecastProps {
  lake: GeoJsonFeature;
}

interface WeatherData {
  time: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  weatherSymbol: string;
  humidity: number;
}

interface WeatherApiResponse {
  properties: {
    timeseries: Array<{
      time: string;
      data: {
        instant: {
          details: {
            air_temperature: number;
            wind_speed: number;
            wind_from_direction: number;
            relative_humidity: number;
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
      };
    }>;
  };
}

const WeatherContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const ForecastCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2]
}));

const HourlyItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 70,
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const WeatherIcon: React.FC<{ symbolCode: string }> = ({ symbolCode }) => {
  const iconProps = { fontSize: 'medium' as const, color: 'primary' as const };
  
  if (symbolCode.includes('clearsky') || symbolCode.includes('fair')) {
    return <WbSunnyIcon {...iconProps} sx={{ color: '#FDB813' }} />;
  } else if (symbolCode.includes('rain') || symbolCode.includes('sleet')) {
    return <WaterDropIcon {...iconProps} sx={{ color: '#2196F3' }} />;
  } else if (symbolCode.includes('snow')) {
    return <AcUnitIcon {...iconProps} sx={{ color: '#64B5F6' }} />;
  } else if (symbolCode.includes('thunder')) {
    return <ThunderstormIcon {...iconProps} sx={{ color: '#616161' }} />;
  } else {
    return <CloudIcon {...iconProps} sx={{ color: '#90A4AE' }} />;
  }
};

const WeatherForecast: React.FC<WeatherForecastProps> = ({ lake }) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, [lake]);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    const [lng, lat] = lake.geometry.coordinates;
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FishingWatersApp/1.0 (https://github.com/larsakeekstrand/fishingwaters)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: WeatherApiResponse = await response.json();
      
      // Extract next 48 hours of data (every 3 hours for display)
      const now = new Date();
      const endTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      
      const processedData: WeatherData[] = [];
      let lastHour = -1;
      
      for (const item of data.properties.timeseries) {
        const itemTime = new Date(item.time);
        
        if (itemTime > endTime) break;
        if (itemTime < now) continue;
        
        const hour = itemTime.getHours();
        const hoursDiff = Math.floor((itemTime.getTime() - now.getTime()) / (60 * 60 * 1000));
        
        // Take data approximately every 3 hours
        if ((hoursDiff % 3 === 0 || processedData.length === 0) && item.data.next_1_hours && hour !== lastHour) {
          processedData.push({
            time: item.time,
            temperature: Math.round(item.data.instant.details.air_temperature),
            windSpeed: Math.round(item.data.instant.details.wind_speed * 3.6), // Convert m/s to km/h
            windDirection: item.data.instant.details.wind_from_direction,
            precipitation: item.data.next_1_hours.details.precipitation_amount || 0,
            weatherSymbol: item.data.next_1_hours.summary.symbol_code,
            humidity: item.data.instant.details.relative_humidity
          });
          lastHour = hour;
        }
      }
      
      setWeatherData(processedData.slice(0, 16)); // Show max 16 items (48 hours / 3)
      setLoading(false);
    } catch (err) {
      setError('Kunde inte hämta väderdata');
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const isToday = new Date().toDateString() === date.toDateString();
    const isTomorrow = new Date(Date.now() + 86400000).toDateString() === date.toDateString();
    
    if (isToday) return `${hours}:00`;
    if (isTomorrow) return `i morgon ${hours}:00`;
    return `${date.getDate()}/${date.getMonth() + 1} ${hours}:00`;
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NÖ', 'Ö', 'SÖ', 'S', 'SV', 'V', 'NV'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  if (loading) {
    return (
      <WeatherContainer>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={40} />
        </Box>
      </WeatherContainer>
    );
  }

  if (error) {
    return (
      <WeatherContainer>
        <Alert severity="error">{error}</Alert>
      </WeatherContainer>
    );
  }

  if (weatherData.length === 0) {
    return (
      <WeatherContainer>
        <Typography variant="body2" color="text.secondary">
          Ingen väderdata tillgänglig
        </Typography>
      </WeatherContainer>
    );
  }

  return (
    <WeatherContainer>
      <Typography variant="subtitle2" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ThermostatIcon fontSize="small" />
        Väderprognos 48h
      </Typography>
      
      <ForecastCard>
        <Box sx={{ overflowX: 'auto', overflowY: 'hidden' }}>
          <Stack direction="row" spacing={1} sx={{ minWidth: 'fit-content' }}>
            {weatherData.map((data, index) => (
              <React.Fragment key={data.time}>
                <HourlyItem>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                    {formatTime(data.time)}
                  </Typography>
                  
                  <Box my={1}>
                    <WeatherIcon symbolCode={data.weatherSymbol} />
                  </Box>
                  
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {data.temperature}°
                  </Typography>
                  
                  {data.precipitation > 0 && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <WaterDropIcon sx={{ fontSize: 12, color: '#2196F3' }} />
                      <Typography variant="caption" color="text.secondary">
                        {data.precipitation.toFixed(1)}mm
                      </Typography>
                    </Stack>
                  )}
                  
                  <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                    <AirIcon sx={{ fontSize: 12, color: '#757575' }} />
                    <Typography variant="caption" color="text.secondary">
                      {data.windSpeed} {getWindDirection(data.windDirection)}
                    </Typography>
                  </Stack>
                </HourlyItem>
                
                {index < weatherData.length - 1 && (
                  <Divider orientation="vertical" flexItem />
                )}
              </React.Fragment>
            ))}
          </Stack>
        </Box>
      </ForecastCard>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
        Data från api.met.no
      </Typography>
    </WeatherContainer>
  );
};

export default WeatherForecast;