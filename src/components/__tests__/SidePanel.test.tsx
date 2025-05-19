import React from 'react';
import { render, screen } from '@testing-library/react';
import SidePanel from '../SidePanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock the WeatherPanel component
jest.mock('../WeatherPanel', () => {
  return function MockWeatherPanel({ selectedLake }: { selectedLake: GeoJsonFeature }) {
    return <div data-testid="weather-panel">Weather Panel Mock</div>;
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

  it('includes the WeatherPanel when a lake is selected', () => {
    render(<SidePanel selectedLake={mockLake} />);
    expect(screen.getByTestId('weather-panel')).toBeInTheDocument();
  });

  it('does not include the WeatherPanel when no lake is selected', () => {
    render(<SidePanel selectedLake={null} />);
    expect(screen.queryByTestId('weather-panel')).not.toBeInTheDocument();
  });
});
