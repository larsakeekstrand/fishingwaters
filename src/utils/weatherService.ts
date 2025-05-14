import { GeoJsonFeature } from '../types/GeoJsonTypes';

/**
 * Weather data interface from api.met.no
 */
export interface WeatherData {
  properties: {
    timeseries: Array<{
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

/**
 * Simplified weather information to display in the UI
 */
export interface WeatherInfo {
  temperature: number;
  windSpeed: number;
  humidity: number;
  symbolCode: string;
  precipitation: number;
  time: string;
  location: string;
}

/**
 * Fetches weather data from api.met.no
 * @param lake The lake to fetch weather data for
 * @returns Promise with weather information
 */
export const fetchWeatherData = async (lake: GeoJsonFeature): Promise<WeatherInfo | null> => {
  if (!lake || !lake.geometry || !lake.geometry.coordinates) {
    return null;
  }

  try {
    // api.met.no requires coordinates in [latitude, longitude] format
    // but GeoJSON uses [longitude, latitude]
    const longitude = lake.geometry.coordinates[0];
    const latitude = lake.geometry.coordinates[1];
    
    // api.met.no requires a proper User-Agent header
    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'FishingWaters/1.0 github.com/yourname/fishingwaters'
        }
      }
    );

    if (!response.ok) {
      console.error('Weather API error:', response.status, response.statusText);
      return null;
    }

    const data: WeatherData = await response.json();
    
    // Get the current weather from the first timeseries entry
    const currentWeather = data.properties.timeseries[0];
    if (!currentWeather) {
      return null;
    }

    // Extract the required weather information
    return {
      temperature: currentWeather.data.instant.details.air_temperature,
      windSpeed: currentWeather.data.instant.details.wind_speed,
      humidity: currentWeather.data.instant.details.relative_humidity,
      symbolCode: currentWeather.data.next_1_hours?.summary.symbol_code || 'cloudy',
      precipitation: currentWeather.data.next_1_hours?.details.precipitation_amount || 0,
      time: new Date(currentWeather.time).toLocaleString(),
      location: lake.properties.name
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

/**
 * Gets the appropriate weather icon based on the symbol code
 * @param symbolCode The weather symbol code from api.met.no
 * @returns The icon name
 */
export const getWeatherIcon = (symbolCode: string): string => {
  // Map api.met.no symbol codes to Material UI icon names
  // This is a simplified mapping, you can extend this as needed
  const iconMap: Record<string, string> = {
    'clearsky': 'wb_sunny',
    'fair': 'wb_sunny',
    'partlycloudy': 'partly_cloudy_day',
    'cloudy': 'cloud',
    'rainshowers': 'shower',
    'rain': 'rainy',
    'heavyrain': 'thunderstorm',
    'fog': 'foggy',
    'snow': 'ac_unit',
    'sleet': 'ac_unit',
    'thunder': 'flash_on'
  };

  // Default to cloudy if symbol code is not recognized
  return iconMap[symbolCode.split('_')[0]] || 'cloud';
};