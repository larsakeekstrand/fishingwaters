import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeatherForecast from '../WeatherForecast';
import * as weatherService from '../../utils/weatherService';

// Mock the weather service
jest.mock('../../utils/weatherService');
const mockWeatherService = weatherService as jest.Mocked<typeof weatherService>;

describe('WeatherForecast', () => {
  const mockProps = {
    latitude: 59.3293,
    longitude: 18.0686,
    lakeName: 'Test Lake',
  };

  const mockWeatherData = {
    location: { latitude: 59.3293, longitude: 18.0686 },
    forecast: [
      {
        temperature: 15,
        symbol: 'clearsky_day',
        precipitation: 0,
        windSpeed: 5,
        windDirection: 180,
        humidity: 60,
        time: '2023-12-25T12:00:00Z',
      },
      {
        temperature: 12,
        symbol: 'partlycloudy_day',
        precipitation: 0.5,
        windSpeed: 8,
        windDirection: 200,
        humidity: 70,
        time: '2023-12-25T15:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWeatherService.getWeatherIcon.mockImplementation((symbol) => {
      const icons: { [key: string]: string } = {
        'clearsky_day': '☀️',
        'partlycloudy_day': '⛅',
      };
      return icons[symbol] || '❓';
    });
    mockWeatherService.formatTime.mockImplementation((time) => '12:00');
    mockWeatherService.formatDate.mockImplementation((time) => 'mån 25 dec');
  });

  it('shows loading state initially', () => {
    mockWeatherService.fetchWeatherForecast.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<WeatherForecast {...mockProps} />);

    expect(screen.getByText('Hämtar väderprognos...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays weather forecast when data is loaded successfully', async () => {
    mockWeatherService.fetchWeatherForecast.mockResolvedValue(mockWeatherData);

    render(<WeatherForecast {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Väderprognos - 48h')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Lake')).toBeInTheDocument();
    expect(screen.getByText('15°C')).toBeInTheDocument();
    expect(screen.getByText('12°C')).toBeInTheDocument();
    expect(screen.getByText('Data från met.no')).toBeInTheDocument();
  });

  it('displays error message when weather fetch fails', async () => {
    const errorMessage = 'Weather fetch failed';
    mockWeatherService.fetchWeatherForecast.mockRejectedValue(new Error(errorMessage));

    render(<WeatherForecast {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays info message when no forecast data is available', async () => {
    mockWeatherService.fetchWeatherForecast.mockResolvedValue({
      location: { latitude: 59.3293, longitude: 18.0686 },
      forecast: [],
    });

    render(<WeatherForecast {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Ingen väderprognos tillgänglig')).toBeInTheDocument();
    });
  });

  it('displays weather icons and wind information', async () => {
    mockWeatherService.fetchWeatherForecast.mockResolvedValue(mockWeatherData);

    render(<WeatherForecast {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('☀️')).toBeInTheDocument();
      expect(screen.getByText('⛅')).toBeInTheDocument();
    });

    expect(screen.getByText('5m/s')).toBeInTheDocument();
    expect(screen.getByText('0.5mm 8m/s')).toBeInTheDocument();
  });
});