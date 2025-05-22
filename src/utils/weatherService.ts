export interface WeatherData {
  temperature: number;
  symbol: string;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  time: string;
}

export interface WeatherForecast {
  location: {
    latitude: number;
    longitude: number;
  };
  forecast: WeatherData[];
}

const USER_AGENT = 'FishingWaters/1.0 (https://github.com/larsakeekstrand/fishingwaters)';

export const fetchWeatherForecast = async (
  latitude: number, 
  longitude: number
): Promise<WeatherForecast> => {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process the response to extract 48 hours of forecast data
    const forecast: WeatherData[] = [];
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    data.properties.timeseries.forEach((entry: any) => {
      const entryTime = new Date(entry.time);
      
      if (entryTime <= fortyEightHoursFromNow) {
        const instant = entry.data.instant.details;
        const next1Hours = entry.data.next_1_hours;
        
        forecast.push({
          temperature: Math.round(instant.air_temperature),
          symbol: next1Hours?.summary?.symbol_code || 'unknown',
          precipitation: next1Hours?.details?.precipitation_amount || 0,
          windSpeed: Math.round(instant.wind_speed || 0),
          windDirection: instant.wind_from_direction || 0,
          humidity: Math.round(instant.relative_humidity || 0),
          time: entry.time,
        });
      }
    });

    return {
      location: { latitude, longitude },
      forecast: forecast.slice(0, 48), // Ensure we only get 48 hours
    };
  } catch (error) {
    console.error('Failed to fetch weather forecast:', error);
    throw new Error('Kunde inte hämta väderprognos');
  }
};

export const getWeatherIcon = (symbolCode: string): string => {
  // Map met.no symbol codes to emoji or simple text representation
  const iconMap: { [key: string]: string } = {
    'clearsky_day': '☀️',
    'clearsky_night': '🌙',
    'partlycloudy_day': '⛅',
    'partlycloudy_night': '☁️',
    'cloudy': '☁️',
    'rain': '🌧️',
    'rainshowers_day': '🌦️',
    'rainshowers_night': '🌧️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'fog': '🌫️',
    'unknown': '❓',
  };
  
  // Handle symbol codes with intensity suffixes (_light, _heavy)
  // First try exact match, then try without intensity suffix
  if (iconMap[symbolCode]) {
    return iconMap[symbolCode];
  }
  
  // Remove intensity suffix (last part after underscore)
  const baseCode = symbolCode.replace(/_(?:light|heavy)$/, '');
  return iconMap[baseCode] || iconMap['unknown'];
};

export const formatTime = (timeString: string): string => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (timeString: string): string => {
  const date = new Date(timeString);
  return date.toLocaleDateString('sv-SE', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};