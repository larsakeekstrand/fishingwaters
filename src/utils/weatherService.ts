import axios from 'axios';

// Define types for the weather API response
export interface WeatherForecast {
  properties: {
    timeseries: TimeSeriesItem[];
  };
}

export interface TimeSeriesItem {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_speed: number;
        relative_humidity: number;
        precipitation_amount?: number;
      };
    };
    next_1_hours?: {
      details: {
        precipitation_amount: number;
      };
      summary: {
        symbol_code: string;
      };
    };
    next_6_hours?: {
      details: {
        precipitation_amount: number;
      };
      summary: {
        symbol_code: string;
      };
    };
    next_12_hours?: {
      details: {
        precipitation_amount: number;
      };
      summary: {
        symbol_code: string;
      };
    };
  };
}

// Simplified weather data format for our UI
export interface WeatherData {
  time: Date;
  temperature: number;
  symbolCode: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}

const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
const cachedData: {[key: string]: {data: WeatherData[], timestamp: number}} = {};

/**
 * Fetch weather forecast data from api.met.no
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Array of simplified weather data objects
 */
export const fetchWeatherForecast = async (latitude: number, longitude: number): Promise<WeatherData[]> => {
  // Round coordinates to 4 decimal places for better caching
  const roundedLat = Math.round(latitude * 10000) / 10000;
  const roundedLng = Math.round(longitude * 10000) / 10000;
  const cacheKey = `${roundedLat},${roundedLng}`;
  
  // Check if we have cached data that's still valid
  const cachedEntry = cachedData[cacheKey];
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_EXPIRY_TIME) {
    return cachedEntry.data;
  }
  
  try {
    // Define application info for the API
    const appInfo = {
      name: 'FishingWaters',
      version: '1.0.0',
      contact: 'example@example.com'
    };
    
    const response = await axios.get<WeatherForecast>(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact`,
      {
        params: {
          lat: roundedLat,
          lon: roundedLng,
        },
        headers: {
          'User-Agent': `${appInfo.name}/${appInfo.version} ${appInfo.contact}`
        }
      }
    );
    
    // Transform API response to simplified format
    const weatherData = processWeatherData(response.data);
    
    // Cache the data
    cachedData[cacheKey] = {
      data: weatherData,
      timestamp: Date.now()
    };
    
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Process the raw weather API response into a simplified format
 */
const processWeatherData = (forecast: WeatherForecast): WeatherData[] => {
  // Get the forecast for the next 48 hours (roughly 48 hourly entries)
  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  
  // Filter and transform the data
  return forecast.properties.timeseries
    .filter(item => {
      const itemTime = new Date(item.time);
      return itemTime >= now && itemTime <= in48Hours;
    })
    .map(item => {
      // Get the symbol code from the most granular forecast available
      const symbolCode = item.data.next_1_hours?.summary.symbol_code || 
                         item.data.next_6_hours?.summary.symbol_code || 
                         item.data.next_12_hours?.summary.symbol_code || 
                         'clearsky_day'; // Default fallback symbol
      
      // Get precipitation amount from the most granular forecast available
      const precipitation = item.data.next_1_hours?.details.precipitation_amount || 
                           item.data.next_6_hours?.details.precipitation_amount || 
                           item.data.next_12_hours?.details.precipitation_amount || 
                           0;
      
      return {
        time: new Date(item.time),
        temperature: item.data.instant.details.air_temperature,
        symbolCode,
        precipitation,
        windSpeed: item.data.instant.details.wind_speed,
        humidity: item.data.instant.details.relative_humidity
      };
    });
};

/**
 * Maps met.no symbol codes to Material UI icons
 * @param symbolCode Symbol code from the weather API
 * @returns Name of the corresponding Material UI icon
 */
export const mapSymbolToIcon = (symbolCode: string): string => {
  // Handle day/night variations by removing the suffix
  const baseSymbol = symbolCode.replace(/_day|_night|_polartwilight|_polarnight/g, '');
  
  // Map base symbols to Material-UI icon names
  switch(baseSymbol) {
    case 'clearsky':
      return 'WbSunny';
    case 'fair':
      return 'LightMode';
    case 'partlycloudy':
      return 'PartlyCloudy';
    case 'cloudy':
      return 'Cloud';
    case 'fog':
      return 'Foggy';
    case 'rain':
    case 'lightrain':
      return 'WaterDrop';
    case 'heavyrain':
      return 'Thunderstorm';
    case 'sleet':
    case 'lightsleet':
    case 'heavysleet':
      return 'AcUnit';
    case 'snow':
    case 'lightsnow':
    case 'heavysnow':
      return 'Snowflake';
    case 'rainshowers':
    case 'rainshowersandthunder':
    case 'sleetshowers':
    case 'snowshowers':
    case 'lightrainshowers':
    case 'heavyrainshowers':
    case 'lightsleetshowers':
    case 'heavysleetshowers':
    case 'lightsnowshowers':
    case 'heavysnowshowers':
      return 'Grain';
    case 'lightrainandthunder':
    case 'heavyrainandthunder':
    case 'lightsleetandthunder':
    case 'heavysleetandthunder':
    case 'lightsnowandthunder':
    case 'heavysnowandthunder':
    case 'lightrainshowersandthunder':
    case 'heavyrainshowersandthunder':
    case 'lightsleetshowersandthunder':
    case 'heavysleetshowersandthunder':
    case 'lightsnowshowersandthunder':
    case 'heavysnowshowersandthunder':
      return 'Thunderstorm';
    default:
      return 'WbSunny'; // Default fallback
  }
};

/**
 * Gets a friendly description for the weather symbol
 * @param symbolCode Symbol code from the weather API
 * @returns Human-readable description
 */
export const getWeatherDescription = (symbolCode: string): string => {
  // Remove day/night variations
  const baseSymbol = symbolCode.replace(/_day|_night|_polartwilight|_polarnight/g, '');
  
  switch(baseSymbol) {
    case 'clearsky':
      return 'Klart';
    case 'fair':
      return 'Mestadels klart';
    case 'partlycloudy':
      return 'Delvis molnigt';
    case 'cloudy':
      return 'Molnigt';
    case 'fog':
      return 'Dimma';
    case 'rain':
      return 'Regn';
    case 'lightrain':
      return 'Lätt regn';
    case 'heavyrain':
      return 'Kraftigt regn';
    case 'sleet':
      return 'Slask';
    case 'lightsleet':
      return 'Lätt slask';
    case 'heavysleet':
      return 'Kraftig slask';
    case 'snow':
      return 'Snö';
    case 'lightsnow':
      return 'Lätt snöfall';
    case 'heavysnow':
      return 'Kraftigt snöfall';
    case 'rainshowers':
      return 'Regnskurar';
    case 'rainshowersandthunder':
      return 'Regnskurar med åska';
    case 'sleetshowers':
      return 'Slaskskurar';
    case 'snowshowers':
      return 'Snöbyar';
    case 'lightrainshowers':
      return 'Lätta regnskurar';
    case 'heavyrainshowers':
      return 'Kraftiga regnskurar';
    case 'lightsleetshowers':
      return 'Lätta slaskskurar';
    case 'heavysleetshowers':
      return 'Kraftiga slaskskurar';
    case 'lightsnowshowers':
      return 'Lätta snöbyar';
    case 'heavysnowshowers':
      return 'Kraftiga snöbyar';
    case 'lightrainandthunder':
      return 'Lätt regn med åska';
    case 'heavyrainandthunder':
      return 'Kraftigt regn med åska';
    case 'lightsleetandthunder':
      return 'Lätt slask med åska';
    case 'heavysleetandthunder':
      return 'Kraftig slask med åska';
    case 'lightsnowandthunder':
      return 'Lätt snöfall med åska';
    case 'heavysnowandthunder':
      return 'Kraftigt snöfall med åska';
    case 'lightrainshowersandthunder':
      return 'Lätta regnskurar med åska';
    case 'heavyrainshowersandthunder':
      return 'Kraftiga regnskurar med åska';
    case 'lightsleetshowersandthunder':
      return 'Lätta slaskskurar med åska';
    case 'heavysleetshowersandthunder':
      return 'Kraftiga slaskskurar med åska';
    case 'lightsnowshowersandthunder':
      return 'Lätta snöbyar med åska';
    case 'heavysnowshowersandthunder':
      return 'Kraftiga snöbyar med åska';
    default:
      return 'Okänt väder';
  }
};