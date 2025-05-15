import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import WeatherForecast from '../WeatherForecast';

// Mock fetch
const originalFetch = global.fetch;

describe('WeatherForecast Component', () => {
  const mockCoordinates: [number, number] = [18.0686, 59.3293]; // Example coordinates
  const mockLakeName = 'Test Lake';
  
  const mockWeatherData = {
    properties: {
      timeseries: [
        {
          time: '2025-05-15T12:00:00Z',
          data: {
            instant: {
              details: {
                air_temperature: 15.2,
                wind_speed: 5.1,
                relative_humidity: 76
              }
            },
            next_1_hours: {
              summary: {
                symbol_code: 'partlycloudy'
              },
              details: {
                precipitation_amount: 0.1
              }
            }
          }
        },
        {
          time: '2025-05-15T18:00:00Z',
          data: {
            instant: {
              details: {
                air_temperature: 12.8,
                wind_speed: 4.3,
                relative_humidity: 82
              }
            },
            next_1_hours: {
              summary: {
                symbol_code: 'cloudy'
              },
              details: {
                precipitation_amount: 0
              }
            }
          }
        },
        {
          time: '2025-05-16T00:00:00Z',
          data: {
            instant: {
              details: {
                air_temperature: 10.5,
                wind_speed: 3.2,
                relative_humidity: 88
              }
            },
            next_1_hours: {
              summary: {
                symbol_code: 'rain'
              },
              details: {
                precipitation_amount: 1.2
              }
            }
          }
        }
      ]
    }
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders loading state initially', () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // Never resolves
    
    render(<WeatherForecast coordinates={mockCoordinates} lakeName={mockLakeName} />);
    
    expect(screen.getByText('Väderprognos')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state when API call fails', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({})
      })
    );
    
    render(<WeatherForecast coordinates={mockCoordinates} lakeName={mockLakeName} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load weather forecast')).toBeInTheDocument();
    });
  });

  it('renders weather forecast data when API call succeeds', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWeatherData)
      })
    );
    
    render(<WeatherForecast coordinates={mockCoordinates} lakeName={mockLakeName} />);
    
    await waitFor(() => {
      expect(screen.getByText(`Väderprognos för ${mockLakeName}`)).toBeInTheDocument();
      expect(screen.getByText('15.2°C')).toBeInTheDocument();
      expect(screen.getByText('Vind: 5.1 m/s')).toBeInTheDocument();
      expect(screen.getByText('Nederbörd: 0.1 mm')).toBeInTheDocument();
    });
  });

  it('makes API call with correct parameters', () => {
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWeatherData)
      })
    );
    
    render(<WeatherForecast coordinates={mockCoordinates} lakeName={mockLakeName} />);
    
    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${mockCoordinates[1]}&lon=${mockCoordinates[0]}`,
      {
        headers: {
          'User-Agent': 'FishingWaters/1.0 github.com/larsakeekstrand/fishingwaters'
        }
      }
    );
  });

  it('renders nothing when coordinates are null', () => {
    const { container } = render(<WeatherForecast coordinates={null} lakeName={mockLakeName} />);
    expect(container.firstChild).toBeNull();
  });
});