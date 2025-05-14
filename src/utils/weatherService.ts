import { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  isLoading: boolean;
  error: string | null;
}

export const weatherCodeToDescription = (code: number): string => {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs
  const weatherCodes: Record<number, string> = {
    0: 'Klar himmel',
    1: 'Mestadels klar',
    2: 'Delvis molnigt',
    3: 'Molnigt',
    45: 'Dimma',
    48: 'Rimfrost',
    51: 'Lätt duggregn',
    53: 'Måttligt duggregn',
    55: 'Kraftigt duggregn',
    56: 'Lätt underkylt duggregn',
    57: 'Kraftigt underkylt duggregn',
    61: 'Lätt regn',
    63: 'Måttligt regn',
    65: 'Kraftigt regn',
    66: 'Lätt underkylt regn',
    67: 'Kraftigt underkylt regn',
    71: 'Lätt snöfall',
    73: 'Måttligt snöfall',
    75: 'Kraftigt snöfall',
    77: 'Snökorn',
    80: 'Lätta regnskurar',
    81: 'Måttliga regnskurar',
    82: 'Kraftiga regnskurar',
    85: 'Lätta snöbyar',
    86: 'Kraftiga snöbyar',
    95: 'Åskväder',
    96: 'Åskväder med lätt hagel',
    99: 'Åskväder med kraftigt hagel',
  };

  return weatherCodes[code] || 'Okänt väder';
};

export const useWeatherData = (latitude: number, longitude: number): WeatherData => {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 0,
    windSpeed: 0,
    weatherCode: 0,
    weatherDescription: '',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!latitude || !longitude) {
        setWeatherData(prevState => ({
          ...prevState,
          isLoading: false,
          error: 'Ogiltiga koordinater'
        }));
        return;
      }

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
        );

        if (!response.ok) {
          throw new Error(`Väderdata kunde inte hämtas: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.current) {
          const weatherCode = data.current.weather_code;
          
          setWeatherData({
            temperature: data.current.temperature_2m,
            windSpeed: data.current.wind_speed_10m,
            weatherCode,
            weatherDescription: weatherCodeToDescription(weatherCode),
            isLoading: false,
            error: null
          });
        } else {
          throw new Error('Ogiltig väderdata från API');
        }
      } catch (error) {
        setWeatherData(prevState => ({
          ...prevState,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Ett okänt fel uppstod'
        }));
      }
    };

    setWeatherData(prevState => ({ ...prevState, isLoading: true }));
    fetchWeatherData();
  }, [latitude, longitude]);

  return weatherData;
};