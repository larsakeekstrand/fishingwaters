import { GeoJsonFeature } from '../types/GeoJsonTypes';

export interface WeatherData {
  temperature?: number;
  weatherSymbol?: string;
  weatherDescription?: string;
  windSpeed?: number;
  windDirection?: number;
  precipitation?: number;
  humidity?: number;
  feelsLike?: number;
  cloudCover?: number;
  uv?: number;
  errorMessage?: string;
}

/**
 * Function to fetch weather data from MET Norway API
 * @param feature GeoJsonFeature containing the lake data
 * @returns Promise<WeatherData> with current weather information
 */
export const fetchWeatherData = async (feature: GeoJsonFeature): Promise<WeatherData> => {
  try {
    // Extract coordinates from feature (note: MET API expects lat/lon, but GeoJSON has lon/lat)
    const [longitude, latitude] = feature.geometry.coordinates;
    
    // Construct URL for the API
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`;

    // Send request with proper headers (required by MET Norway API)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FishingWaters/1.0 github.com/larsakeekstrand/fishingwaters',
      },
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Get current weather data from the first timeseries
    const currentWeather = data.properties.timeseries[0];
    const weatherData = currentWeather.data;
    
    // Extract relevant information
    return {
      temperature: weatherData.instant.details.air_temperature,
      weatherSymbol: weatherData.next_1_hours?.summary.symbol_code || 
                     weatherData.next_6_hours?.summary.symbol_code,
      weatherDescription: getWeatherDescription(
        weatherData.next_1_hours?.summary.symbol_code || 
        weatherData.next_6_hours?.summary.symbol_code
      ),
      windSpeed: weatherData.instant.details.wind_speed,
      windDirection: weatherData.instant.details.wind_from_direction,
      precipitation: weatherData.next_1_hours?.details.precipitation_amount || 0,
      humidity: weatherData.instant.details.relative_humidity,
      feelsLike: calculateFeelsLike(
        weatherData.instant.details.air_temperature,
        weatherData.instant.details.wind_speed,
        weatherData.instant.details.relative_humidity
      ),
      cloudCover: weatherData.instant.details.cloud_area_fraction,
      uv: weatherData.instant.details.ultraviolet_index_clear_sky,
    };
  } catch (error) {
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error fetching weather data:', error);
    }
    return {
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch weather data',
    };
  }
};

/**
 * Map weather symbols to human-readable descriptions
 */
export const getWeatherDescription = (symbolCode?: string): string => {
  if (!symbolCode) return 'Okänd';
  
  const descriptions: Record<string, string> = {
    'clearsky': 'Klart',
    'fair': 'Uppehåll',
    'partlycloudy': 'Delvis moln',
    'cloudy': 'Molnigt',
    'fog': 'Dimma',
    'rain': 'Regn',
    'heavyrain': 'Kraftigt regn',
    'sleet': 'Slask',
    'snow': 'Snö',
    'heavysnow': 'Kraftigt snöfall',
    'rainshowers': 'Regnskurar',
    'rainshowersandthunder': 'Regnskurar och åska',
    'snowshowers': 'Snöbyar',
    'snowshowersandthunder': 'Snöbyar och åska',
    'sleetshowersandthunder': 'Slaskbyar och åska',
    'lightrainshowersandthunder': 'Lätta regnskurar och åska',
    'heavyrainshowersandthunder': 'Kraftiga regnskurar och åska',
    'lightsnowshowersandthunder': 'Lätta snöbyar och åska',
    'heavysnowshowersandthunder': 'Kraftiga snöbyar och åska',
    'lightrainandthunder': 'Lätt regn och åska',
    'lightsleetandthunder': 'Lätt slask och åska',
    'heavysleetandthunder': 'Kraftig slask och åska',
    'lightsnowandthunder': 'Lätt snö och åska',
    'heavysnowandthunder': 'Kraftigt snöfall och åska',
    'lightrainshowers': 'Lätta regnskurar',
    'heavyrainshowers': 'Kraftiga regnskurar',
    'lightsleetshowers': 'Lätta slaskbyar',
    'heavysleetshowers': 'Kraftiga slaskbyar',
    'lightsnowshowers': 'Lätta snöbyar',
    'heavysnowshowers': 'Kraftiga snöbyar',
    'lightsleet': 'Lätt slask',
    'heavysleet': 'Kraftig slask',
    'lightsnow': 'Lätt snö',
    'lightrain': 'Lätt regn'
  };

  // Handle day/night/polar variations
  const baseCode = symbolCode.split('_')[0];
  return descriptions[baseCode] || 'Okänd';
};

/**
 * Calculate "feels like" temperature based on temperature, wind speed, and humidity
 */
export const calculateFeelsLike = (temperature: number, windSpeed: number, humidity: number): number => {
  // Simple wind chill calculation for cold temperatures
  if (temperature < 10) {
    return Math.round((13.12 + 0.6215 * temperature - 11.37 * Math.pow(windSpeed, 0.16) + 
      0.3965 * temperature * Math.pow(windSpeed, 0.16)) * 10) / 10;
  }
  // Heat index calculation for warm temperatures with high humidity
  else if (temperature > 20 && humidity > 40) {
    const heatIndex = -8.784695 + 1.61139411 * temperature + 2.338549 * humidity - 
      0.14611605 * temperature * humidity - 0.012308094 * Math.pow(temperature, 2) - 
      0.016424828 * Math.pow(humidity, 2) + 0.002211732 * Math.pow(temperature, 2) * humidity + 
      0.00072546 * temperature * Math.pow(humidity, 2) - 
      0.000003582 * Math.pow(temperature, 2) * Math.pow(humidity, 2);
    return Math.round(heatIndex * 10) / 10;
  }
  // For moderate temperatures, the actual temperature is close to the feels-like temperature
  else {
    return temperature;
  }
};