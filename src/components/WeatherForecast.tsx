import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Divider, 
  CircularProgress,
  Alert,
  Tabs,
  Tab 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { GeoJsonFeature } from '../types/GeoJsonTypes';
import { 
  fetchWeatherForecast, 
  WeatherData, 
  mapSymbolToIcon, 
  getWeatherDescription 
} from '../utils/weatherService';

// Import all weather-related icons
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LightModeIcon from '@mui/icons-material/LightMode';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudQueueIcon from '@mui/icons-material/CloudQueue'; // Replace Foggy with CloudQueue
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import GrainIcon from '@mui/icons-material/Grain';
import AirIcon from '@mui/icons-material/Air';
import OpacityIcon from '@mui/icons-material/Opacity';

interface WeatherForecastProps {
  selectedLake: GeoJsonFeature;
}

const StyledWeatherPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default
}));

const WeatherCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[3],
  }
}));

const WeatherForecast: React.FC<WeatherForecastProps> = ({ selectedLake }) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Weather data is grouped by days
  const [todayForecast, setTodayForecast] = useState<WeatherData[]>([]);
  const [tomorrowForecast, setTomorrowForecast] = useState<WeatherData[]>([]);
  
  // Get coordinates from the selected lake
  const lakeCoordinates = selectedLake.geometry.coordinates;
  // Convert from [lng, lat] to [lat, lng]
  const latitude = lakeCoordinates[1];
  const longitude = lakeCoordinates[0];
  
  useEffect(() => {
    const getWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const forecast = await fetchWeatherForecast(latitude, longitude);
        setWeatherData(forecast);
        
        // Group forecasts by day
        groupForecastsByDay(forecast);
      } catch (err: any) {
        setError(err.message || 'Kunde inte hämta väderprognos');
        console.error('Error fetching weather data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getWeatherData();
  }, [latitude, longitude]);
  
  const groupForecastsByDay = (forecast: WeatherData[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const todayItems = forecast.filter(item => {
      const itemDate = new Date(item.time);
      return itemDate >= today && itemDate < tomorrow;
    });
    
    const tomorrowItems = forecast.filter(item => {
      const itemDate = new Date(item.time);
      return itemDate >= tomorrow && itemDate < dayAfterTomorrow;
    });
    
    setTodayForecast(todayItems);
    setTomorrowForecast(tomorrowItems);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Get current weather (first item in the forecast)
  const currentWeather = weatherData.length > 0 ? weatherData[0] : null;
  
  // Function to render the appropriate weather icon
  const renderWeatherIcon = (symbolCode: string, size: 'small' | 'medium' | 'large' = 'medium') => {
    const iconType = mapSymbolToIcon(symbolCode);
    
    switch (iconType) {
      case 'WbSunny':
        return <WbSunnyIcon fontSize={size} color="warning" />;
      case 'LightMode':
        return <LightModeIcon fontSize={size} color="warning" />;
      case 'PartlyCloudy':
        return <CloudQueueIcon fontSize={size} color="action" />;
      case 'Cloud':
        return <CloudIcon fontSize={size} color="action" />;
      case 'Foggy':
        return <CloudQueueIcon fontSize={size} color="disabled" />;
      case 'WaterDrop':
        return <WaterDropIcon fontSize={size} color="info" />;
      case 'Thunderstorm':
        return <ThunderstormIcon fontSize={size} color="error" />;
      case 'AcUnit':
        return <AcUnitIcon fontSize={size} color="info" />;
      case 'Snowflake':
        return <AcUnitIcon fontSize={size} color="info" />;
      case 'Grain':
        return <GrainIcon fontSize={size} color="info" />;
      default:
        return <WbSunnyIcon fontSize={size} color="warning" />;
    }
  };
  
  // Format date to display only hour and minutes
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date to display weekday
  const formatWeekday = (date: Date): string => {
    return date.toLocaleDateString('sv-SE', { weekday: 'long' });
  };
  
  if (loading) {
    return (
      <StyledWeatherPanel>
        <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="medium">
          Väderprognos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </StyledWeatherPanel>
    );
  }
  
  if (error) {
    return (
      <StyledWeatherPanel>
        <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="medium">
          Väderprognos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="error">{error}</Alert>
      </StyledWeatherPanel>
    );
  }
  
  if (!currentWeather) {
    return (
      <StyledWeatherPanel>
        <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="medium">
          Väderprognos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info">Ingen väderprognos tillgänglig</Alert>
      </StyledWeatherPanel>
    );
  }
  
  // Choose the forecast array based on the selected tab
  const selectedForecast = tabValue === 0 ? todayForecast : tomorrowForecast;
  
  return (
    <StyledWeatherPanel>
      <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="medium">
        Väderprognos
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {/* Current weather */}
      <Box mb={3} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="body2" color="text.secondary" align="center">
          Just nu i {selectedLake.properties.name}
        </Typography>
        
        <Box 
          mt={1} 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          flexDirection="column"
        >
          {renderWeatherIcon(currentWeather.symbolCode, 'large')}
          <Typography variant="h4" mt={1} fontWeight="bold">
            {Math.round(currentWeather.temperature)}°C
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getWeatherDescription(currentWeather.symbolCode)}
          </Typography>
        </Box>
        
        <Box 
          mt={2} 
          display="flex" 
          justifyContent="space-around" 
          width="100%" 
          sx={{ maxWidth: 400, mx: 'auto' }}
        >
          <Box display="flex" alignItems="center">
            <WaterDropIcon fontSize="small" color="info" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {currentWeather.precipitation} mm
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <AirIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {currentWeather.windSpeed} m/s
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <OpacityIcon fontSize="small" color="info" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {Math.round(currentWeather.humidity)}%
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Forecast tabs */}
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        centered 
        sx={{ mb: 2 }}
        variant="fullWidth"
      >
        <Tab 
          label="Idag" 
          id="weather-tab-0" 
          aria-controls="weather-tabpanel-0" 
        />
        <Tab 
          label="Imorgon" 
          id="weather-tab-1" 
          aria-controls="weather-tabpanel-1" 
        />
      </Tabs>
      
      {/* Hourly forecast */}
      <Box role="tabpanel" id={`weather-tabpanel-${tabValue}`} aria-labelledby={`weather-tab-${tabValue}`}>
        <Typography variant="body2" color="text.secondary" align="center" mb={2}>
          {tabValue === 0 ? 'Idag' : 'Imorgon'} ({formatWeekday(selectedForecast[0]?.time || new Date())})
        </Typography>
        
        <Grid container spacing={1}>
          {selectedForecast.slice(0, 8).map((hourData, index) => (
            <Grid item xs={3} key={index}>
              <WeatherCard>
                <Typography variant="caption" fontWeight="medium">
                  {formatTime(hourData.time)}
                </Typography>
                {renderWeatherIcon(hourData.symbolCode, 'small')}
                <Typography variant="body2" mt={0.5} fontWeight="bold">
                  {Math.round(hourData.temperature)}°C
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <WaterDropIcon fontSize="small" color="info" sx={{ mr: 0.5, fontSize: 14 }} />
                  <Typography variant="caption">
                    {hourData.precipitation} mm
                  </Typography>
                </Box>
              </WeatherCard>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Data source attribution */}
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Typography variant="caption" color="text.secondary">
          Data från api.met.no
        </Typography>
      </Box>
    </StyledWeatherPanel>
  );
};

export default WeatherForecast;