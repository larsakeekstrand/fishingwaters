import React from 'react';
import { render, screen } from '@testing-library/react';
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
  
  it('displays the directions button', () => {
    render(<SidePanel selectedLake={mockLake} />);
    expect(screen.getByText('Vägbeskrivning')).toBeInTheDocument();
  });
  
  it('has a button that opens Google Maps directions', () => {
    // Mock window.open
    const windowOpenMock = jest.fn();
    Object.defineProperty(window, 'open', {
      value: windowOpenMock,
      writable: true
    });
    
    render(<SidePanel selectedLake={mockLake} />);
    
    // Click the directions button
    screen.getByText('Vägbeskrivning').click();
    
    // Check if window.open was called with the correct URL
    expect(windowOpenMock).toHaveBeenCalledTimes(1);
    expect(windowOpenMock.mock.calls[0][0]).toContain('https://www.google.com/maps/dir/?api=1&destination=59.3293,18.0686');
    expect(windowOpenMock.mock.calls[0][1]).toBe('_blank');
  });
});
