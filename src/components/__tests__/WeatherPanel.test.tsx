import React from 'react';
import { render, screen } from '@testing-library/react';
import WeatherPanel from '../WeatherPanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock fetch
global.fetch = jest.fn();

// Mock implementation of fetch to avoid actual API calls
(global.fetch as jest.Mock).mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      properties: {
        timeseries: [{
          time: '2023-05-19T12:00:00Z',
          data: {
            instant: {
              details: {
                air_temperature: 20,
                wind_speed: 5,
                wind_from_direction: 180
              }
            },
            next_1_hours: { summary: { symbol_code: 'clearsky_day' } },
            next_6_hours: { summary: { symbol_code: 'fair_day' } }
          }
        }]
      }
    })
  })
);

describe('WeatherPanel', () => {
  const mockLake: GeoJsonFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [18.0686, 59.3293] // [longitude, latitude]
    },
    properties: {
      name: 'Test Lake',
      county: 'Test County',
      location: 'Test Location',
      maxDepth: 10,
      area: 1000,
      elevation: 50
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    render(<WeatherPanel selectedLake={mockLake} />);
    
    expect(screen.getByText('Loading weather forecast...')).toBeInTheDocument();
  });

  it('calls fetch with correct parameters', () => {
    render(<WeatherPanel selectedLake={mockLake} />);
    
    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.3293&lon=18.0686`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.any(String)
        })
      })
    );
  });

  it('displays error message when fetch fails', async () => {
    // Override the default mock implementation for this test
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );
    
    render(<WeatherPanel selectedLake={mockLake} />);
    
    // Wait for the error message to appear
    const errorElement = await screen.findByText('Failed to load weather data. Please try again later.');
    expect(errorElement).toBeInTheDocument();
  });
});