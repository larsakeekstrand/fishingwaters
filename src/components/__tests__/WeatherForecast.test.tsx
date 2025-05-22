import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeatherForecast from '../WeatherForecast';
import * as weatherService from '../../utils/weatherService';

// Mock the weather service
jest.mock('../../utils/weatherService');

const mockWeatherService = weatherService as jest.Mocked<typeof weatherService>;

describe('WeatherForecast', () => {
  const mockWeatherData = [
    {
      time: '2023-10-15T12:00:00Z',
      temperature: 15,
      symbolCode: 'clearsky_day',
      precipitation: 0,
      windSpeed: 10,
      humidity: 65,
    },
    {
      time: '2023-10-15T18:00:00Z',
      temperature: 12,
      symbolCode: 'partlycloudy_day',
      precipitation: 0.5,
      windSpeed: 8,
      humidity: 70,
    },
    {
      time: '2023-10-16T06:00:00Z',
      temperature: 8,
      symbolCode: 'rain',
      precipitation: 2.1,
      windSpeed: 15,
      humidity: 85,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockWeatherService.getWeatherIconUrl.mockImplementation(
      (symbolCode) => `https://api.met.no/images/weathericons/svg/${symbolCode}.svg`
    );
    mockWeatherService.formatTime.mockImplementation((timeString) => {
      if (timeString === '2023-10-15T18:00:00Z') return 'Imorgon 18:00';
      if (timeString === '2023-10-16T06:00:00Z') return 'Tis 06:00';
      return 'Nu';
    });
  });

  it('displays loading state initially', () => {
    mockWeatherService.fetchWeatherData.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<WeatherForecast latitude={59.3293} longitude={18.0686} lakeName="Test Lake" />);

    expect(screen.getByText('Väderprognos')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays weather forecast when data loads successfully', async () => {
    mockWeatherService.fetchWeatherData.mockResolvedValueOnce(mockWeatherData);

    render(<WeatherForecast latitude={59.3293} longitude={18.0686} lakeName="Test Lake" />);

    await waitFor(() => {
      expect(screen.getByText('Väderprognos för Test Lake')).toBeInTheDocument();
    });

    // Check current weather display
    expect(screen.getByText('15°C')).toBeInTheDocument();
    expect(screen.getByText('💨 10 km/h')).toBeInTheDocument();
    expect(screen.getByText('💧 65%')).toBeInTheDocument();

    // Check forecast section
    expect(screen.getByText('48-timmarsprognos')).toBeInTheDocument();
    expect(screen.getByText('12°C')).toBeInTheDocument();
    expect(screen.getByText('8°C')).toBeInTheDocument();

    // Check precipitation display for rainy day
    expect(screen.getByText('2.1 mm')).toBeInTheDocument();

    // Check attribution
    expect(screen.getByText(/Data från yr.no/)).toBeInTheDocument();
  });

  it('displays error message when weather data fails to load', async () => {
    mockWeatherService.fetchWeatherData.mockRejectedValueOnce(new Error('API Error'));

    render(<WeatherForecast latitude={59.3293} longitude={18.0686} lakeName="Test Lake" />);

    await waitFor(() => {
      expect(screen.getByText('Kunde inte hämta väderdata')).toBeInTheDocument();
    });

    expect(screen.getByText('Väderprognos')).toBeInTheDocument();
  });

  it('calls fetchWeatherData with correct coordinates', () => {
    mockWeatherService.fetchWeatherData.mockResolvedValueOnce(mockWeatherData);

    render(<WeatherForecast latitude={59.3293} longitude={18.0686} lakeName="Test Lake" />);

    expect(mockWeatherService.fetchWeatherData).toHaveBeenCalledWith(59.3293, 18.0686);
  });

  it('refetches data when coordinates change', async () => {
    mockWeatherService.fetchWeatherData.mockResolvedValue(mockWeatherData);

    const { rerender } = render(
      <WeatherForecast latitude={59.3293} longitude={18.0686} lakeName="Test Lake" />
    );

    expect(mockWeatherService.fetchWeatherData).toHaveBeenCalledTimes(1);

    rerender(<WeatherForecast latitude={60.0} longitude={19.0} lakeName="Test Lake" />);

    expect(mockWeatherService.fetchWeatherData).toHaveBeenCalledTimes(2);
    expect(mockWeatherService.fetchWeatherData).toHaveBeenLastCalledWith(60.0, 19.0);
  });

  it('displays weather icons correctly', async () => {
    mockWeatherService.fetchWeatherData.mockResolvedValueOnce(mockWeatherData);

    render(<WeatherForecast latitude={59.3293} longitude={18.0686} lakeName="Test Lake" />);

    await waitFor(() => {
      const icons = screen.getAllByAltText('Weather icon');
      expect(icons).toHaveLength(3); // Current + 2 forecast items
    });

    expect(mockWeatherService.getWeatherIconUrl).toHaveBeenCalledWith('clearsky_day');
    expect(mockWeatherService.getWeatherIconUrl).toHaveBeenCalledWith('partlycloudy_day');
    expect(mockWeatherService.getWeatherIconUrl).toHaveBeenCalledWith('rain');
  });

  it('only shows precipitation chip when precipitation > 0', async () => {
    mockWeatherService.fetchWeatherData.mockResolvedValueOnce(mockWeatherData);

    render(<WeatherForecast latitude={59.3293} longitude={18.0686} lakeName="Test Lake" />);

    await waitFor(() => {
      expect(screen.getByText('Väderprognos för Test Lake')).toBeInTheDocument();
    });

    // Current weather has no precipitation, so chip should not be visible
    const precipitationChips = screen.queryAllByText(/🌧️/);
    expect(precipitationChips).toHaveLength(0);
  });
});