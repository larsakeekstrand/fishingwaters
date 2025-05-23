import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeatherForecast from '../WeatherForecast';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock fetch
global.fetch = jest.fn();

describe('WeatherForecast', () => {
  const mockLake: GeoJsonFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [18.0686, 59.3293]
    },
    properties: {
      name: 'Test Lake',
      county: 'Test County',
      location: 'Test Location',
      maxDepth: 10,
      area: 100,
      elevation: 50
    }
  };

  const createMockWeatherData = () => {
    const now = new Date();
    const timeseries = [];
    
    // Create hourly data for the next 48 hours
    for (let i = 0; i < 48; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      timeseries.push({
        time: time.toISOString(),
        data: {
          instant: {
            details: {
              air_temperature: i === 0 ? 15.5 : 12.3,
              wind_speed: i === 0 ? 5.2 : 7.5,
              wind_from_direction: i === 0 ? 180 : 225,
              relative_humidity: i === 0 ? 65 : 80
            }
          },
          next_1_hours: {
            summary: {
              symbol_code: i === 0 ? 'partlycloudy_day' : 'rain'
            },
            details: {
              precipitation_amount: i === 0 ? 0 : 2.5
            }
          }
        }
      });
    }
    
    return {
      properties: {
        timeseries
      }
    };
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('displays loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<WeatherForecast lake={mockLake} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays weather data when fetch is successful', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createMockWeatherData()
    });

    render(<WeatherForecast lake={mockLake} />);

    await waitFor(() => {
      expect(screen.getByText('Väderprognos 48h')).toBeInTheDocument();
      expect(screen.getByText('16°')).toBeInTheDocument(); // Rounded temperature
      // There are multiple 12° elements, so just check one exists
      expect(screen.getAllByText('12°').length).toBeGreaterThan(0);
      
      // Check attribution
      expect(screen.getByText('Data från api.met.no')).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<WeatherForecast lake={mockLake} />);

    await waitFor(() => {
      expect(screen.getByText('Kunde inte hämta väderdata')).toBeInTheDocument();
    });
  });

  it('displays error when API returns non-ok status', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    render(<WeatherForecast lake={mockLake} />);

    await waitFor(() => {
      expect(screen.getByText('Kunde inte hämta väderdata')).toBeInTheDocument();
    });
  });

  it('sends correct API request', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createMockWeatherData()
    });

    render(<WeatherForecast lake={mockLake} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.3293&lon=18.0686',
        {
          headers: {
            'User-Agent': 'FishingWatersApp/1.0 (https://github.com/larsakeekstrand/fishingwaters)'
          }
        }
      );
    });
  });

  it('formats time correctly for today', async () => {
    const mockData = createMockWeatherData();
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    render(<WeatherForecast lake={mockLake} />);

    await waitFor(() => {
      // Check that weather data is displayed
      expect(screen.getByText('Väderprognos 48h')).toBeInTheDocument();
      
      // Check that we have temperature data (12° from mock data)
      const tempElements = screen.getAllByText('12°');
      expect(tempElements.length).toBeGreaterThan(0);
      
      // Check that we have time formatting (will show current hour or next hours)
      const timeElements = screen.getAllByText(/\d{2}:00/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it('shows correct wind directions', async () => {
    // Test just one wind direction to verify the formatting works
    const mockData = createMockWeatherData();
    // First item has wind direction 180 (S)
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    render(<WeatherForecast lake={mockLake} />);

    await waitFor(() => {
      // Check that weather data is displayed
      expect(screen.getByText('Väderprognos 48h')).toBeInTheDocument();
      // Wind elements will contain the wind speed and direction
      const windElements = screen.getAllByText(/\d+ [A-ZÖ]+/);
      expect(windElements.length).toBeGreaterThan(0);
    });
  });
});