import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import SidePanel from '../SidePanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

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

  const mockFeatures: GeoJsonFeature[] = [mockLake];
  const mockOnLakeSelect = jest.fn();
  const mockOnMapRefocus = jest.fn();

  beforeEach(() => {
    mockOnLakeSelect.mockClear();
    mockOnMapRefocus.mockClear();
  });

  it('displays default message when no lake is selected', () => {
    renderWithTheme(
      <SidePanel 
        selectedLake={null} 
        features={mockFeatures}
        onLakeSelect={mockOnLakeSelect}
        onMapRefocus={mockOnMapRefocus}
      />
    );
    expect(screen.getByText(/Sök efter en sjö ovan eller välj en sjö på kartan/)).toBeInTheDocument();
  });

  it('displays lake information when a lake is selected', () => {
    renderWithTheme(
      <SidePanel 
        selectedLake={mockLake}
        features={mockFeatures}
        onLakeSelect={mockOnLakeSelect}
        onMapRefocus={mockOnMapRefocus}
      />
    );

    expect(screen.getByText('Test Lake')).toBeInTheDocument();
    expect(screen.getByText('10 m')).toBeInTheDocument();
    expect(screen.getByText(/ha/)).toBeInTheDocument();
    expect(screen.getByText('Test County')).toBeInTheDocument();
    expect(screen.getByText('Pike, Perch')).toBeInTheDocument();
    expect(screen.getByText('Pike (60%)')).toBeInTheDocument();
    expect(screen.getByText('Perch (40%)')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });
});
