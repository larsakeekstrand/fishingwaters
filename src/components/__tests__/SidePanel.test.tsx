import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SidePanel from '../SidePanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';
import * as weatherService from '../../utils/weatherService';

// Mock the weather service
jest.mock('../../utils/weatherService');

describe('SidePanel', () => {
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

  const mockWeatherInfo = {
    temperature: 15.2,
    windSpeed: 5.1,
    humidity: 65,
    symbolCode: 'partlycloudy_day',
    precipitation: 0.2,
    time: '2023-05-01 12:00:00',
    location: 'Test Lake'
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (weatherService.fetchWeatherData as jest.Mock).mockResolvedValue(mockWeatherInfo);
    (weatherService.getWeatherIcon as jest.Mock).mockReturnValue('partly_cloudy_day');
  });

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

  it('renders weather information when a lake is selected', async () => {
    render(<SidePanel selectedLake={mockLake} />);
    
    // Weather heading should be displayed
    expect(screen.getByText('Väder')).toBeInTheDocument();
    
    // Initially, there might be a loading indicator
    expect(weatherService.fetchWeatherData).toHaveBeenCalledWith(mockLake);
    
    // Wait for the weather data to be loaded
    await waitFor(() => {
      expect(screen.getByText('15°C')).toBeInTheDocument();
      expect(screen.getByText('Vind:')).toBeInTheDocument();
      expect(screen.getByText('5.1 m/s')).toBeInTheDocument();
      expect(screen.getByText('Luftfuktighet:')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('Nederbörd:')).toBeInTheDocument();
      expect(screen.getByText('0.2 mm')).toBeInTheDocument();
    });
  });

  it('handles weather service errors gracefully', async () => {
    // Mock the weather service to return null (error)
    (weatherService.fetchWeatherData as jest.Mock).mockResolvedValue(null);
    
    render(<SidePanel selectedLake={mockLake} />);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Väderinformation kunde inte hämtas')).toBeInTheDocument();
    });
  });
});
