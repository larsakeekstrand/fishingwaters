import { GeoJsonFeature } from '../types/GeoJsonTypes';

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  symbolCode: string;
  precipitation: number;
  humidity: number;
  weatherDescription: string;
}

/**
 * Fetches weather data from api.met.no for a specific lake
 * @param lake The GeoJsonFeature representing a lake
 * @returns Promise<WeatherData> with current weather information
 */
export const fetchWeatherData = async (lake: GeoJsonFeature): Promise<WeatherData> => {
  try {
    const { coordinates } = lake.geometry;
    const [longitude, latitude] = coordinates;
    
    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'FishingWaters/1.0 github.com/larsakeekstrand/fishingwaters',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const currentData = data.properties.timeseries[0].data;
    
    // Extract relevant weather details
    const details = currentData.instant.details;
    const nextHour = currentData.next_1_hours || {};
    
    // Get the weather symbol code
    const symbolCode = nextHour.summary?.symbol_code || '';
    
    // Get the weather description based on the symbol code
    const weatherDescription = getWeatherDescription(symbolCode);

    return {
      temperature: details.air_temperature,
      windSpeed: details.wind_speed,
      windDirection: getWindDirection(details.wind_from_direction),
      symbolCode,
      precipitation: nextHour.details?.precipitation_amount || 0,
      humidity: details.relative_humidity,
      weatherDescription,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Converts wind direction in degrees to cardinal direction
 * @param degrees Wind direction in degrees
 * @returns String representing cardinal direction (N, NE, E, etc.)
 */
export const getWindDirection = (degrees: number): string => {
  // Normalize the degrees to be between 0 and 360
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  
  // Handle edge cases to match the expected test values
  if (normalizedDegrees <= 22.5 || normalizedDegrees > 337.5) {
    return 'N';
  } else if (normalizedDegrees <= 67.5) {
    return 'NE';
  } else if (normalizedDegrees <= 112.5) {
    return 'E';
  } else if (normalizedDegrees <= 157.5) {
    return 'SE';
  } else if (normalizedDegrees <= 202.5) {
    return 'S';
  } else if (normalizedDegrees <= 247.5) {
    return 'SW';
  } else if (normalizedDegrees <= 292.5) {
    return 'W';
  } else {
    return 'NW';
  }
};

/**
 * Maps weather symbol codes to human-readable descriptions
 * @param symbolCode The weather symbol code from the API
 * @returns Human-readable weather description
 */
export const getWeatherDescription = (symbolCode: string): string => {
  const symbolMap: Record<string, string> = {
    'clearsky': 'Klart',
    'fair': 'Mestadels klart',
    'partlycloudy': 'Delvis molnigt',
    'cloudy': 'Molnigt',
    'rainshowers': 'Regnskurar',
    'rainshowersandthunder': 'Regnskurar med åska',
    'sleetshowers': 'Snöblandat regn',
    'snowshowers': 'Snöbyar',
    'rain': 'Regn',
    'heavyrain': 'Kraftigt regn',
    'heavyrainandthunder': 'Kraftigt regn med åska',
    'sleet': 'Snöblandat regn',
    'snow': 'Snö',
    'snowandthunder': 'Snöfall med åska',
    'fog': 'Dimma',
    'sleetshowersandthunder': 'Snöblandat regn med åska',
    'snowshowersandthunder': 'Snöbyar med åska',
    'rainandthunder': 'Regn med åska',
    'sleetandthunder': 'Snöblandat regn med åska',
    'lightrain': 'Lätt regn',
    'lightrainandthunder': 'Lätt regn med åska',
    'heavysnow': 'Kraftigt snöfall',
    'heavysnowandthunder': 'Kraftigt snöfall med åska',
  };

  // Handle day/night variations by removing _day, _night, etc.
  const baseCode = symbolCode.split('_')[0];
  return symbolMap[baseCode] || 'Okänt väder';
};