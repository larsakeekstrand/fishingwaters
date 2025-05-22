import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import WeatherForecast from '../WeatherForecast';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Mock fetch
global.fetch = jest.fn();

// Create dynamic mock data with current times
const createMockWeatherResponse = () => {
  const now = new Date();
  const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  
  return {
    properties: {
      timeseries: [
        {
          time: now.toISOString(),
          data: {
            instant: {
              details: {
                air_temperature: 5.2,
                wind_speed: 3.1,
                wind_from_direction: 180
              }
            },
            next_1_hours: {
              summary: {
                symbol_code: 'partlycloudy_day'
              },
              details: {
                precipitation_amount: 0.1
              }
            }
          }
        },
        {
          time: in3Hours.toISOString(),
          data: {
            instant: {
              details: {
                air_temperature: 7.8,
                wind_speed: 2.5,
                wind_from_direction: 225
              }
            },
            next_1_hours: {
              summary: {
                symbol_code: 'fair_day'
              },
              details: {
                precipitation_amount: 0
              }
            }
          }
        }
      ]
    }
  };
};

describe('WeatherForecast', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    renderWithTheme(
      <WeatherForecast latitude={59.3293} longitude={18.0686} />
    );

    expect(screen.getByText('Hämtar väderprognos...')).toBeInTheDocument();
  });

  test('renders weather data after successful fetch', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createMockWeatherResponse()
    });

    renderWithTheme(
      <WeatherForecast latitude={59.3293} longitude={18.0686} />
    );

    await waitFor(() => {
      expect(screen.getByText('Väderprognos (48h)')).toBeInTheDocument();
    });

    expect(screen.getByText('5°C')).toBeInTheDocument();
    expect(screen.getByText('8°C')).toBeInTheDocument();
    expect(screen.getByText('Väderdata från MET Norway')).toBeInTheDocument();
  });

  test('renders error message on API failure', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    renderWithTheme(
      <WeatherForecast latitude={59.3293} longitude={18.0686} />
    );

    await waitFor(() => {
      expect(screen.getByText('Kunde inte hämta väderprognos')).toBeInTheDocument();
    });
  });

  test('makes API call with correct coordinates', () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createMockWeatherResponse()
    });

    renderWithTheme(
      <WeatherForecast latitude={59.3293} longitude={18.0686} />
    );

    expect(fetch).toHaveBeenCalledWith(
      'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.3293&lon=18.0686',
      {
        headers: {
          'User-Agent': 'FishingWaters/1.0 (github.com/larsakeekstrand/fishingwaters)'
        }
      }
    );
  });

  test('handles HTTP error responses', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429
    });

    renderWithTheme(
      <WeatherForecast latitude={59.3293} longitude={18.0686} />
    );

    await waitFor(() => {
      expect(screen.getByText('Kunde inte hämta väderprognos')).toBeInTheDocument();
    });
  });

  test('displays wind information correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createMockWeatherResponse()
    });

    renderWithTheme(
      <WeatherForecast latitude={59.3293} longitude={18.0686} />
    );

    await waitFor(() => {
      expect(screen.getByText('3 m/s S')).toBeInTheDocument();
      expect(screen.getByText('3 m/s SW')).toBeInTheDocument();
    });
  });

  test('displays precipitation when present', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createMockWeatherResponse()
    });

    renderWithTheme(
      <WeatherForecast latitude={59.3293} longitude={18.0686} />
    );

    await waitFor(() => {
      expect(screen.getByText('0.1mm')).toBeInTheDocument();
    });
  });
});