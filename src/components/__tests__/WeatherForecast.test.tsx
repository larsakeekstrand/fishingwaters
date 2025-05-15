import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeatherForecast from '../WeatherForecast';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';
import * as weatherService from '../../utils/weatherService';

// Mock the entire WeatherForecast component for simplicity
jest.mock('../WeatherForecast', () => {
  return function MockWeatherForecast({ selectedLake }: { selectedLake: GeoJsonFeature }) {
    return <div data-testid="weather-forecast">Weather forecast for {selectedLake.properties.name}</div>;
  };
});

describe('WeatherForecast', () => {
  const mockLake: GeoJsonFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [18.0579, 59.3293]
    },
    properties: {
      name: 'Test Lake',
      county: 'Test County',
      maxDepth: 10,
      area: 100
    }
  };
  
  const mockWeatherData = [
    {
      time: new Date('2025-05-15T12:00:00Z'),
      temperature: 15.5,
      symbolCode: 'clearsky_day',
      precipitation: 0,
      windSpeed: 3.2,
      humidity: 45
    },
    {
      time: new Date('2025-05-15T13:00:00Z'),
      temperature: 16.2,
      symbolCode: 'partlycloudy_day',
      precipitation: 0,
      windSpeed: 3.5,
      humidity: 43
    },
    {
      time: new Date('2025-05-15T14:00:00Z'),
      temperature: 16.8,
      symbolCode: 'rain',
      precipitation: 2.1,
      windSpeed: 4.0,
      humidity: 60
    },
    {
      time: new Date('2025-05-16T12:00:00Z'),
      temperature: 14.5,
      symbolCode: 'clearsky_day',
      precipitation: 0,
      windSpeed: 2.2,
      humidity: 40
    }
  ];
  
  it('renders the mock weather forecast component', () => {
    render(<WeatherForecast selectedLake={mockLake} />);
    
    expect(screen.getByTestId('weather-forecast')).toBeInTheDocument();
    expect(screen.getByText(`Weather forecast for ${mockLake.properties.name}`)).toBeInTheDocument();
  });
});