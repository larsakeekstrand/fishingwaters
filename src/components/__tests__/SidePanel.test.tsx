import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import SidePanel from '../SidePanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';
import * as weatherService from '../../utils/weatherService';

describe('SidePanel', () => {
  const mockWeatherData = {
    temperature: 12.5,
    windSpeed: 4.2,
    windDirection: 'NW',
    symbolCode: 'partlycloudy',
    precipitation: 0.3,
    humidity: 75,
    weatherDescription: 'Delvis molnigt'
  };

  beforeEach(() => {
    // Mock the fetchWeatherData function
    jest.spyOn(weatherService, 'fetchWeatherData').mockResolvedValue(mockWeatherData);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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
      catchedSpecies: ['Pike', 'Perch'],
      vanlArt: 'Pike',
      vanlArtWProc: 60,
      nästVanlArt: 'Perch',
      nästVanlArtWProc: 40,
      senasteFiskeår: '2023'
    }
  };

  it('displays default message when no lake is selected', () => {
    render(<SidePanel selectedLake={null} />);
    expect(screen.getByText('Välj en sjö på kartan för att se mer information')).toBeInTheDocument();
  });

  it('displays lake information when a lake is selected', () => {
    render(<SidePanel selectedLake={mockLake} />);

    expect(screen.getByText('Test Lake')).toBeInTheDocument();
    expect(screen.getByText('10 m')).toBeInTheDocument();
    expect(screen.getByText('1,000 ha')).toBeInTheDocument();
    expect(screen.getByText('Test County')).toBeInTheDocument();
    expect(screen.getByText('Pike, Perch')).toBeInTheDocument();
    expect(screen.getByText('Pike (60%)')).toBeInTheDocument();
    expect(screen.getByText('Perch (40%)')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('displays weather information when a lake is selected', async () => {
    // Create a promise that we can resolve when we want
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    // Mock the fetchWeatherData function to return our controlled promise
    jest.spyOn(weatherService, 'fetchWeatherData').mockReturnValue(promise as Promise<any>);
    
    render(<SidePanel selectedLake={mockLake} />);

    // Verify that the weather service was called with the correct lake
    expect(weatherService.fetchWeatherData).toHaveBeenCalledWith(mockLake);
    
    // Resolve the promise with the mock data
    await act(async () => {
      resolvePromise(mockWeatherData);
    });
    
    // Now check that the weather data is displayed
    expect(screen.getByText('Aktuellt väder')).toBeInTheDocument();
    expect(screen.getByText('Delvis molnigt')).toBeInTheDocument();
    expect(screen.getByText('Temperatur: 12.5°C')).toBeInTheDocument();
    expect(screen.getByText('Vind: 4.2 m/s NW')).toBeInTheDocument();
    expect(screen.getByText('Nederbörd: 0.3 mm')).toBeInTheDocument();
    expect(screen.getByText('Luftfuktighet: 75%')).toBeInTheDocument();
  });

  it('shows error message when weather data fetch fails', async () => {
    // Create a promise that we can reject when we want
    let rejectPromise: (reason: any) => void;
    const promise = new Promise((_, reject) => {
      rejectPromise = reject;
    });
    
    // Mock the fetchWeatherData function to return our controlled promise
    jest.spyOn(weatherService, 'fetchWeatherData').mockReturnValue(promise as Promise<any>);
    
    render(<SidePanel selectedLake={mockLake} />);
    
    // Reject the promise with an error
    await act(async () => {
      rejectPromise(new Error('Failed to fetch'));
    });
    
    // Check that the error message is displayed
    expect(screen.getByText('Kunde inte hämta väderdata')).toBeInTheDocument();
  });
});
