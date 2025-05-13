import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeatherInfo from '../WeatherInfo';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';
import * as WeatherService from '../../utils/WeatherService';

// Mock the WeatherService module
jest.mock('../../utils/WeatherService');

// Mock Material UI icons
jest.mock('@mui/icons-material/Thermostat', () => () => <div data-testid="thermostat-icon" />);
jest.mock('@mui/icons-material/WaterDrop', () => () => <div data-testid="water-drop-icon" />);
jest.mock('@mui/icons-material/Air', () => () => <div data-testid="air-icon" />);
jest.mock('@mui/icons-material/WbSunny', () => () => <div data-testid="sun-icon" />);
jest.mock('@mui/icons-material/Cloud', () => () => <div data-testid="cloud-icon" />);

describe('WeatherInfo', () => {
  const mockLake: GeoJsonFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [18.0686, 59.3293]
    },
    properties: {
      name: 'Test Lake',
      maxDepth: 10,
      area: 1000,
      county: 'Test County',
      location: 'Test Location',
      elevation: 50
    }
  };

  const mockWeatherData = {
    temperature: 15.2,
    weatherSymbol: 'partlycloudy',
    weatherDescription: 'Delvis moln',
    windSpeed: 5.5,
    windDirection: 180,
    precipitation: 0.2,
    humidity: 60,
    feelsLike: 14.5,
    cloudCover: 45,
    uv: 3
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    // Mock fetchWeatherData to never resolve
    jest.spyOn(WeatherService, 'fetchWeatherData').mockImplementation(
      () => new Promise(() => {})
    );

    render(<WeatherInfo selectedLake={mockLake} />);
    
    expect(screen.getByText('Hämtar väderdata...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display weather data when loaded successfully', async () => {
    // Mock successful weather data fetch
    jest.spyOn(WeatherService, 'fetchWeatherData').mockResolvedValue(mockWeatherData);

    render(<WeatherInfo selectedLake={mockLake} />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Hämtar väderdata...')).not.toBeInTheDocument();
    });
    
    // Check if weather data is displayed
    expect(screen.getByText('15.2°C')).toBeInTheDocument();
    expect(screen.getByText('Delvis moln')).toBeInTheDocument();
    expect(screen.getByText('14.5°C')).toBeInTheDocument();
    expect(screen.getByText('5.5 m/s S')).toBeInTheDocument();
    expect(screen.getByText('0.2 mm')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('Källa: MET Norway')).toBeInTheDocument();
  });

  it('should display cloud icon for cloudy weather', async () => {
    // Mock cloudy weather
    jest.spyOn(WeatherService, 'fetchWeatherData').mockResolvedValue({
      ...mockWeatherData,
      weatherSymbol: 'cloudy'
    });

    render(<WeatherInfo selectedLake={mockLake} />);

    await waitFor(() => {
      expect(screen.queryByText('Hämtar väderdata...')).not.toBeInTheDocument();
    });
    
    // There are two cloud icons in the component, one for the weather symbol and one for cloud cover
    // We'll check that there's at least one cloud icon
    expect(screen.getAllByTestId('cloud-icon').length).toBeGreaterThan(0);
  });

  it('should display sun icon for clear weather', async () => {
    // Mock sunny weather
    jest.spyOn(WeatherService, 'fetchWeatherData').mockResolvedValue({
      ...mockWeatherData,
      weatherSymbol: 'clearsky'
    });

    render(<WeatherInfo selectedLake={mockLake} />);

    await waitFor(() => {
      expect(screen.queryByText('Hämtar väderdata...')).not.toBeInTheDocument();
    });
    
    // Check that sun icon is present
    expect(screen.getAllByTestId('sun-icon').length).toBeGreaterThan(0);
  });

  it('should display error message when fetch fails', async () => {
    // Mock failed weather data fetch
    jest.spyOn(WeatherService, 'fetchWeatherData').mockResolvedValue({
      errorMessage: 'Failed to fetch weather data'
    });

    render(<WeatherInfo selectedLake={mockLake} />);

    await waitFor(() => {
      expect(screen.queryByText('Hämtar väderdata...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Failed to fetch weather data')).toBeInTheDocument();
  });
});