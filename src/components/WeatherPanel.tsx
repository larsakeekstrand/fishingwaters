import React, { useState, useEffect } from 'react';
import { 
  Box,
  Paper, 
  Typography, 
  CircularProgress, 
  Divider,
  Grid,
  IconButton,
  Collapse,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import GrainIcon from '@mui/icons-material/Grain';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import OpacityIcon from '@mui/icons-material/Opacity';
import WaterIcon from '@mui/icons-material/Water';
import AirIcon from '@mui/icons-material/Air';
import { GeoJsonFeature } from '../types/GeoJsonTypes';

interface WeatherPanelProps {
  selectedLake: GeoJsonFeature;
}

interface WeatherData {
  current: {
    time: string;
    temperature: number;
    symbolCode: string;
    windSpeed: number;
    windDirection: number;
  };
  forecast: Array<{
    time: string;
    symbolCode: string;
    temperatureMax: number;
    temperatureMin: number;
  }>;
  isLoading: boolean;
  error: string | null;
}

const StyledWeatherPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(3),
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const ForecastBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  borderRight: `1px solid ${theme.palette.primary.dark}`,
  '&:last-child': {
    borderRight: 'none',
  },
}));

const WeatherPanel: React.FC<WeatherPanelProps> = ({ selectedLake }) => {
  const [expanded, setExpanded] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData>({
    current: {
      time: '',
      temperature: 0,
      symbolCode: '',
      windSpeed: 0,
      windDirection: 0,
    },
    forecast: [],
    isLoading: true,
    error: null,
  });

  const lakeLatitude = selectedLake.geometry.coordinates[1];
  const lakeLongitude = selectedLake.geometry.coordinates[0];

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setWeatherData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Fetch data from MET Norway API
        const response = await fetch(
          `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lakeLatitude}&lon=${lakeLongitude}`,
          {
            headers: {
              'User-Agent': 'FishingWaters/1.0 github.com/larsakeekstrand/fishingwaters',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch weather data: ${response.status}`);
        }

        const data = await response.json();
        
        // Process the data to extract current weather and forecast
        const processedData = processWeatherData(data);
        setWeatherData({
          ...processedData,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setWeatherData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load weather data. Please try again later.',
        }));
      }
    };

    fetchWeatherData();
  }, [lakeLatitude, lakeLongitude]);

  const processWeatherData = (data: any) => {
    const timeseries = data.properties.timeseries;
    
    // Current weather (first time point)
    const currentData = timeseries[0];
    const current = {
      time: new Date(currentData.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: Math.round(currentData.data.instant.details.air_temperature),
      symbolCode: currentData.data.next_1_hours?.summary.symbol_code || 
                 currentData.data.next_6_hours?.summary.symbol_code || 
                 'clearsky_day',
      windSpeed: Math.round(currentData.data.instant.details.wind_speed),
      windDirection: currentData.data.instant.details.wind_from_direction,
    };

    // Get the daily forecast for next 48 hours (in 24h chunks)
    const forecast = [];
    
    // Process today's forecast (using data from noon or closest available time)
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    
    // Find data for today noon or closest after
    const todayNoonIndex = timeseries.findIndex(
      (item: any) => new Date(item.time) >= today
    );
    
    if (todayNoonIndex !== -1) {
      const todayData = timeseries[todayNoonIndex];
      const todayTemp = todayData.data.instant.details.air_temperature;
      
      // Find min temperature for today (from current time to end of day)
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      
      let minTempToday = todayTemp;
      let maxTempToday = todayTemp;
      
      timeseries.forEach((item: any, index: number) => {
        const itemTime = new Date(item.time);
        if (itemTime <= endOfToday && index >= 0) {
          const temp = item.data.instant.details.air_temperature;
          if (temp < minTempToday) minTempToday = temp;
          if (temp > maxTempToday) maxTempToday = temp;
        }
      });
      
      forecast.push({
        time: 'Today',
        symbolCode: todayData.data.next_6_hours?.summary.symbol_code || 
                   todayData.data.next_12_hours?.summary.symbol_code || 
                   'clearsky_day',
        temperatureMax: Math.round(maxTempToday),
        temperatureMin: Math.round(minTempToday),
      });
    }
    
    // Process tomorrow's forecast
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    
    const tomorrowNoonIndex = timeseries.findIndex(
      (item: any) => new Date(item.time) >= tomorrow
    );
    
    if (tomorrowNoonIndex !== -1) {
      const tomorrowData = timeseries[tomorrowNoonIndex];
      const tomorrowTemp = tomorrowData.data.instant.details.air_temperature;
      
      // Find min/max temperature for tomorrow
      const startOfTomorrow = new Date();
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      startOfTomorrow.setHours(0, 0, 0, 0);
      
      const endOfTomorrow = new Date();
      endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
      endOfTomorrow.setHours(23, 59, 59, 999);
      
      let minTempTomorrow = tomorrowTemp;
      let maxTempTomorrow = tomorrowTemp;
      
      timeseries.forEach((item: any) => {
        const itemTime = new Date(item.time);
        if (itemTime >= startOfTomorrow && itemTime <= endOfTomorrow) {
          const temp = item.data.instant.details.air_temperature;
          if (temp < minTempTomorrow) minTempTomorrow = temp;
          if (temp > maxTempTomorrow) maxTempTomorrow = temp;
        }
      });
      
      forecast.push({
        time: 'Tomorrow',
        symbolCode: tomorrowData.data.next_6_hours?.summary.symbol_code || 
                   tomorrowData.data.next_12_hours?.summary.symbol_code || 
                   'clearsky_day',
        temperatureMax: Math.round(maxTempTomorrow),
        temperatureMin: Math.round(minTempTomorrow),
      });
    }
    
    // Process day after tomorrow
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(12, 0, 0, 0);
    
    const dayAfterTomorrowNoonIndex = timeseries.findIndex(
      (item: any) => new Date(item.time) >= dayAfterTomorrow
    );
    
    if (dayAfterTomorrowNoonIndex !== -1) {
      const dayAfterTomorrowData = timeseries[dayAfterTomorrowNoonIndex];
      const dayAfterTomorrowTemp = dayAfterTomorrowData.data.instant.details.air_temperature;
      
      // Find min/max temperature for day after tomorrow
      const startOfDayAfter = new Date();
      startOfDayAfter.setDate(startOfDayAfter.getDate() + 2);
      startOfDayAfter.setHours(0, 0, 0, 0);
      
      const endOfDayAfter = new Date();
      endOfDayAfter.setDate(endOfDayAfter.getDate() + 2);
      endOfDayAfter.setHours(23, 59, 59, 999);
      
      let minTempDayAfter = dayAfterTomorrowTemp;
      let maxTempDayAfter = dayAfterTomorrowTemp;
      
      timeseries.forEach((item: any) => {
        const itemTime = new Date(item.time);
        if (itemTime >= startOfDayAfter && itemTime <= endOfDayAfter) {
          const temp = item.data.instant.details.air_temperature;
          if (temp < minTempDayAfter) minTempDayAfter = temp;
          if (temp > maxTempDayAfter) maxTempDayAfter = temp;
        }
      });
      
      // Get the day name
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(startOfDayAfter);
      
      forecast.push({
        time: dayName,
        symbolCode: dayAfterTomorrowData.data.next_6_hours?.summary.symbol_code || 
                   dayAfterTomorrowData.data.next_12_hours?.summary.symbol_code || 
                   'clearsky_day',
        temperatureMax: Math.round(maxTempDayAfter),
        temperatureMin: Math.round(minTempDayAfter),
      });
    }

    return { current, forecast };
  };

  const getWeatherIcon = (symbolCode: string) => {
    // Map symbol codes to appropriate Material-UI icons
    if (symbolCode.includes('clearsky')) {
      return <WbSunnyIcon />;
    } else if (symbolCode.includes('fair')) {
      return <FilterDramaIcon />;
    } else if (symbolCode.includes('partlycloudy')) {
      return <FilterDramaIcon />;
    } else if (symbolCode.includes('cloudy')) {
      return <CloudIcon />;
    } else if (symbolCode.includes('rain') || symbolCode.includes('shower')) {
      return <OpacityIcon />;
    } else if (symbolCode.includes('heavyrain')) {
      return <WaterIcon />;
    } else if (symbolCode.includes('snow')) {
      return <AcUnitIcon />;
    } else if (symbolCode.includes('sleet')) {
      return <GrainIcon />;
    } else if (symbolCode.includes('thunder')) {
      return <ThunderstormIcon />;
    } else {
      return <WbSunnyIcon />;
    }
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  if (weatherData.isLoading) {
    return (
      <StyledWeatherPanel>
        <Box display="flex" justifyContent="center" alignItems="center" padding={3}>
          <CircularProgress color="inherit" size={24} sx={{ mr: 1 }} />
          <Typography variant="body2">Loading weather forecast...</Typography>
        </Box>
      </StyledWeatherPanel>
    );
  }

  if (weatherData.error) {
    return (
      <StyledWeatherPanel>
        <Alert severity="error" sx={{ mb: 0 }}>
          {weatherData.error}
        </Alert>
      </StyledWeatherPanel>
    );
  }

  return (
    <StyledWeatherPanel>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{ cursor: 'pointer' }}
        onClick={handleToggleExpand}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          Weather Forecast
        </Typography>
        <IconButton size="small" sx={{ color: 'inherit' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded || !expanded}>
        <Box sx={{ mt: 1 }}>
          {/* Current weather */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h3" component="div">
                {weatherData.current.temperature}°
              </Typography>
              <Typography variant="caption">Now</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              {getWeatherIcon(weatherData.current.symbolCode)}
              <Box ml={1}>
                <Typography variant="caption" display="block">
                  Wind: {weatherData.current.windSpeed} m/s
                </Typography>
                <Box display="flex" alignItems="center">
                  <AirIcon 
                    sx={{ 
                      fontSize: 16, 
                      mr: 0.5,
                      transform: `rotate(${weatherData.current.windDirection}deg)`
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          
          {/* Daily forecast */}
          <Box mt={2}>
            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', mb: 1 }} />
            <Grid container>
              {weatherData.forecast.map((day, index) => (
                <Grid item xs={4} key={index}>
                  <ForecastBox>
                    <Typography variant="caption" display="block">
                      {day.time}
                    </Typography>
                    <Box mt={1} mb={1} display="flex" justifyContent="center">
                      {getWeatherIcon(day.symbolCode)}
                    </Box>
                    <Typography variant="body2">
                      {day.temperatureMax}°
                    </Typography>
                    <Typography variant="caption" display="block">
                      {day.temperatureMin}°
                    </Typography>
                  </ForecastBox>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          {/* Attribution */}
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Data from MET Norway
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </StyledWeatherPanel>
  );
};

export default WeatherPanel;