import { useState, useEffect } from 'react';

// Define weather response types
export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  humidity: number;
  weatherSymbol: string;
  weatherDescription: string;
  lastUpdated: Date;
}

export interface WeatherError {
  message: string;
  code?: number;
}

// Function to fetch weather data
export const fetchWeather = async (
  latitude: number, 
  longitude: number
): Promise<WeatherData> => {
  try {
    // api.met.no requires a unique user-agent
    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'FishingWaters/1.0 github.com/larsakeekstrand/fishingwaters',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Get the current weather from the first timeseries
    const currentWeather = data.properties.timeseries[0];
    const details = currentWeather.data.instant.details;
    const nextHour = currentWeather.data.next_1_hours;
    
    return {
      temperature: details.air_temperature,
      windSpeed: details.wind_speed,
      windDirection: details.wind_from_direction,
      precipitation: nextHour ? nextHour.details.precipitation_amount : 0,
      humidity: details.relative_humidity,
      weatherSymbol: nextHour ? nextHour.summary.symbol_code : 'cloudy',
      weatherDescription: getWeatherDescription(nextHour ? nextHour.summary.symbol_code : 'cloudy'),
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Custom hook for weather data
export const useWeather = (latitude: number | null, longitude: number | null) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<WeatherError | null>(null);

  useEffect(() => {
    const getWeather = async () => {
      if (latitude === null || longitude === null) {
        setWeatherData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchWeather(latitude, longitude);
        setWeatherData(data);
      } catch (error) {
        setError({
          message: error instanceof Error ? error.message : 'Unknown error fetching weather',
        });
      } finally {
        setIsLoading(false);
      }
    };

    getWeather();
  }, [latitude, longitude]);

  return { weatherData, isLoading, error };
};

// Helper function to get weather description from symbol code
const getWeatherDescription = (symbolCode: string): string => {
  const descriptions: { [key: string]: string } = {
    'clearsky_day': 'Klart',
    'clearsky_night': 'Klart',
    'clearsky_polartwilight': 'Klart',
    'fair_day': 'Mestadels klart',
    'fair_night': 'Mestadels klart',
    'fair_polartwilight': 'Mestadels klart',
    'partlycloudy_day': 'Delvis molnigt',
    'partlycloudy_night': 'Delvis molnigt',
    'partlycloudy_polartwilight': 'Delvis molnigt',
    'cloudy': 'Molnigt',
    'rainshowers_day': 'Regnskurar',
    'rainshowers_night': 'Regnskurar',
    'rainshowers_polartwilight': 'Regnskurar',
    'rainshowersandthunder_day': 'Regnskurar med åska',
    'rainshowersandthunder_night': 'Regnskurar med åska',
    'rainshowersandthunder_polartwilight': 'Regnskurar med åska',
    'sleetshowers_day': 'Snöblandat regn',
    'sleetshowers_night': 'Snöblandat regn',
    'sleetshowers_polartwilight': 'Snöblandat regn',
    'snowshowers_day': 'Snöbyar',
    'snowshowers_night': 'Snöbyar',
    'snowshowers_polartwilight': 'Snöbyar',
    'rain': 'Regn',
    'heavyrain': 'Kraftigt regn',
    'heavyrainandthunder': 'Kraftigt regn med åska',
    'sleet': 'Snöblandat regn',
    'snow': 'Snö',
    'snowandthunder': 'Snö med åska',
    'fog': 'Dimma',
    'sleetshowersandthunder_day': 'Snöblandat regn med åska',
    'sleetshowersandthunder_night': 'Snöblandat regn med åska',
    'sleetshowersandthunder_polartwilight': 'Snöblandat regn med åska',
    'snowshowersandthunder_day': 'Snöbyar med åska',
    'snowshowersandthunder_night': 'Snöbyar med åska',
    'snowshowersandthunder_polartwilight': 'Snöbyar med åska',
    'rainandthunder': 'Regn med åska',
    'sleetandthunder': 'Snöblandat regn med åska',
    'lightrainshowersandthunder_day': 'Lätta regnskurar med åska',
    'lightrainshowersandthunder_night': 'Lätta regnskurar med åska',
    'lightrainshowersandthunder_polartwilight': 'Lätta regnskurar med åska',
    'lightsleetshowersandthunder_day': 'Lätt snöblandat regn med åska',
    'lightsleetshowersandthunder_night': 'Lätt snöblandat regn med åska',
    'lightsleetshowersandthunder_polartwilight': 'Lätt snöblandat regn med åska',
    'lightsnowshowersandthunder_day': 'Lätta snöbyar med åska',
    'lightsnowshowersandthunder_night': 'Lätta snöbyar med åska',
    'lightsnowshowersandthunder_polartwilight': 'Lätta snöbyar med åska',
    'lightrainandthunder': 'Lätt regn med åska',
    'lightsleetandthunder': 'Lätt snöblandat regn med åska',
    'lightsnowandthunder': 'Lätt snö med åska',
    'lightrainshowers_day': 'Lätta regnskurar',
    'lightrainshowers_night': 'Lätta regnskurar',
    'lightrainshowers_polartwilight': 'Lätta regnskurar',
    'lightsleetshowers_day': 'Lätt snöblandat regn',
    'lightsleetshowers_night': 'Lätt snöblandat regn',
    'lightsleetshowers_polartwilight': 'Lätt snöblandat regn',
    'lightsnowshowers_day': 'Lätta snöbyar',
    'lightsnowshowers_night': 'Lätta snöbyar',
    'lightsnowshowers_polartwilight': 'Lätta snöbyar',
    'lightrain': 'Lätt regn',
    'lightsleet': 'Lätt snöblandat regn',
    'lightsnow': 'Lätt snö'
  };

  return descriptions[symbolCode] || 'Okänt väder';
};