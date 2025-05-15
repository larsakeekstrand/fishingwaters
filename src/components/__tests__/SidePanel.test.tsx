import React from 'react';
import { render, screen } from '@testing-library/react';
import SidePanel from '../SidePanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock the WeatherForecast component
jest.mock('../WeatherForecast', () => {
  return {
    __esModule: true,
    default: ({ coordinates, lakeName }: { coordinates: [number, number] | null, lakeName: string | null }) => (
      <div data-testid="weather-forecast" data-coordinates={coordinates} data-lake-name={lakeName}>
        Mocked Weather Forecast
      </div>
    )
  };
});

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

  it('displays default message when no lake is selected', () => {
    render(<SidePanel selectedLake={null} />);
    expect(screen.getByText('Välj en sjö på kartan för att se mer information')).toBeInTheDocument();
    expect(screen.queryByTestId('weather-forecast')).not.toBeInTheDocument();
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
    
    // Check that WeatherForecast is rendered with correct props
    const weatherForecast = screen.getByTestId('weather-forecast');
    expect(weatherForecast).toBeInTheDocument();
    expect(weatherForecast.getAttribute('data-coordinates')).toBe(mockLake.geometry.coordinates.toString());
    expect(weatherForecast.getAttribute('data-lake-name')).toBe(mockLake.properties.name);
  });
});
