import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidePanel from '../SidePanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

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

  it('has a minimize button', () => {
    render(<SidePanel selectedLake={mockLake} />);
    const minimizeButton = screen.getByRole('button', { name: /Minimize panel/i });
    expect(minimizeButton).toBeInTheDocument();
  });

  it('hides content when minimize button is clicked', () => {
    render(<SidePanel selectedLake={mockLake} />);
    
    // Content should be visible initially
    expect(screen.getByText('Test Lake')).toBeInTheDocument();
    
    // Click minimize button
    const minimizeButton = screen.getByRole('button', { name: /Minimize panel/i });
    fireEvent.click(minimizeButton);
    
    // Content should be hidden
    expect(screen.queryByText('Test Lake')).not.toBeInTheDocument();
    
    // Button should now be for expanding
    expect(screen.getByRole('button', { name: /Expand panel/i })).toBeInTheDocument();
  });
});
