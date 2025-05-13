import React from 'react';
import { render, screen } from '@testing-library/react';
import SidePanel from '../SidePanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock the WeatherInfo component
jest.mock('../WeatherInfo', () => ({
  __esModule: true,
  default: ({ selectedLake }: { selectedLake: GeoJsonFeature }) => (
    <div data-testid="weather-info" data-lake={selectedLake.properties.name}>
      Mocked Weather Info
    </div>
  )
}));

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
    
    // Verify that the WeatherInfo component is rendered with the correct lake
    const weatherInfo = screen.getByTestId('weather-info');
    expect(weatherInfo).toBeInTheDocument();
    expect(weatherInfo).toHaveAttribute('data-lake', 'Test Lake');
  });
});
