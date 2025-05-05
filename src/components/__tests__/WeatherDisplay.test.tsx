import React from 'react';
import { render, screen } from '@testing-library/react';
import WeatherDisplay from '../WeatherDisplay';
import * as WeatherService from '../../utils/WeatherService';

// Mock the useWeather hook
jest.mock('../../utils/WeatherService', () => {
  return {
    useWeather: jest.fn(),
  };
});

describe('WeatherDisplay', () => {
  const mockWeatherData = {
    temperature: 15.2,
    windSpeed: 5.1,
    windDirection: 180.5,
    precipitation: 0.5,
    humidity: 75.3,
    weatherSymbol: 'cloudy',
    weatherDescription: 'Molnigt',
    lastUpdated: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when latitude or longitude is null', () => {
    // Mock the hook to return loading false, no data
    (WeatherService.useWeather as jest.Mock).mockReturnValue({
      weatherData: null,
      isLoading: false,
      error: null,
    });

    const { container } = render(<WeatherDisplay latitude={null} longitude={12.5} />);
    expect(container.firstChild).toBeNull();

    const { container: container2 } = render(<WeatherDisplay latitude={59.5} longitude={null} />);
    expect(container2.firstChild).toBeNull();
  });

  it('shows loading indicator when data is loading', () => {
    // Mock the hook to return loading true
    (WeatherService.useWeather as jest.Mock).mockReturnValue({
      weatherData: null,
      isLoading: true,
      error: null,
    });

    render(<WeatherDisplay latitude={59.5} longitude={12.5} />);
    
    // Check for loading indicator (CircularProgress)
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when an error occurs', () => {
    // Mock the hook to return an error
    const errorMessage = 'Failed to load weather data';
    (WeatherService.useWeather as jest.Mock).mockReturnValue({
      weatherData: null,
      isLoading: false,
      error: { message: errorMessage },
    });

    render(<WeatherDisplay latitude={59.5} longitude={12.5} />);
    
    // Check for error message
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays weather data correctly', () => {
    // Mock the hook to return weather data
    (WeatherService.useWeather as jest.Mock).mockReturnValue({
      weatherData: mockWeatherData,
      isLoading: false,
      error: null,
    });

    render(<WeatherDisplay latitude={59.5} longitude={12.5} />);
    
    // Check for weather information
    expect(screen.getByText('Aktuellt väder')).toBeInTheDocument();
    expect(screen.getByText('15.2°C')).toBeInTheDocument();
    expect(screen.getByText('Molnigt')).toBeInTheDocument();
    
    // Check for wind, humidity, and precipitation info by finding the strong elements
    expect(screen.getByText('Vind:')).toBeInTheDocument();
    expect(screen.getByText('Luftfuktighet:')).toBeInTheDocument();
    expect(screen.getByText('Nederbörd:')).toBeInTheDocument();
    
    // Check for attribution
    const attribution = screen.getByText((content) => content.includes('Källa: api.met.no'));
    expect(attribution).toBeInTheDocument();
    
    // Check for weather icon
    const weatherIcon = screen.getByAltText('Molnigt');
    expect(weatherIcon).toBeInTheDocument();
    expect(weatherIcon).toHaveAttribute('src', 'https://api.met.no/images/weathericons/svg/cloudy.svg');
  });

  it('renders nothing when weather data is null and not loading', () => {
    // Mock the hook to return loading false, no data
    (WeatherService.useWeather as jest.Mock).mockReturnValue({
      weatherData: null,
      isLoading: false,
      error: null,
    });

    const { container } = render(<WeatherDisplay latitude={59.5} longitude={12.5} />);
    expect(container.firstChild).toBeNull();
  });
});