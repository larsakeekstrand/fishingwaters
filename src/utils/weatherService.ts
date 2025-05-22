import { WeatherData, WeatherForecastItem } from '../types/WeatherTypes';

const USER_AGENT = 'FishingWaters/1.0 (https://github.com/larsakeekstrand/fishingwaters)';

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherForecastItem[]> => {
  try {
    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }

    const data: WeatherData = await response.json();
    return processWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

const processWeatherData = (data: WeatherData): WeatherForecastItem[] => {
  const timeseries = data.properties.timeseries;
  const forecast: WeatherForecastItem[] = [];
  
  // Get forecast for next 48 hours, showing every 6 hours
  const now = new Date();
  const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  
  timeseries.forEach((item, index) => {
    const itemTime = new Date(item.time);
    
    if (itemTime <= next48Hours && (index === 0 || itemTime.getUTCHours() % 6 === 0)) {
      const symbolCode = item.data.next_6_hours?.summary.symbol_code || 
                        item.data.next_1_hours?.summary.symbol_code || 
                        'clearsky_day';
      
      const precipitation = item.data.next_6_hours?.details.precipitation_amount || 
                           item.data.next_1_hours?.details.precipitation_amount || 
                           0;
      
      forecast.push({
        time: item.time,
        temperature: Math.round(item.data.instant.details.air_temperature),
        symbolCode,
        precipitation,
        windSpeed: Math.round(item.data.instant.details.wind_speed * 3.6), // Convert m/s to km/h
        humidity: Math.round(item.data.instant.details.relative_humidity),
      });
    }
  });
  
  return forecast.slice(0, 8); // Limit to 8 items (48 hours / 6 hour intervals)
};

export const getWeatherIconUrl = (symbolCode: string): string => {
  return `https://api.met.no/images/weathericons/svg/${symbolCode}.svg`;
};

export const formatTime = (timeString: string): string => {
  const date = new Date(timeString);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return 'Nu';
  }
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Imorgon ${date.getUTCHours().toString().padStart(2, '0')}:00`;
  }
  
  const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
  return `${dayNames[date.getUTCDay()]} ${date.getUTCHours().toString().padStart(2, '0')}:00`;
};