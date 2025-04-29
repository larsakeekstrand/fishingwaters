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

  it('displays driving directions section when a lake is selected', () => {
    render(<SidePanel selectedLake={mockLake} />);
    
    expect(screen.getByText('Vägbeskrivning')).toBeInTheDocument();
    expect(screen.getByLabelText('Min position')).toBeInTheDocument();
    expect(screen.getByText('Visa vägbeskrivning')).toBeInTheDocument();
    
    // Button should have href="#" when no location is entered
    const directionsLink = screen.getByText('Visa vägbeskrivning').closest('a');
    expect(directionsLink).toHaveAttribute('href', '#');
    expect(directionsLink).toHaveAttribute('aria-disabled', 'true');
  });

  it('enables directions button when location is entered', () => {
    render(<SidePanel selectedLake={mockLake} />);
    
    // Enter a location
    const locationInput = screen.getByLabelText('Min position');
    fireEvent.change(locationInput, { target: { value: 'Stockholm' } });
    
    // Button should be enabled now
    const directionsLink = screen.getByText('Visa vägbeskrivning').closest('a');
    expect(directionsLink).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('creates correct Google Maps URL with entered location', () => {
    render(<SidePanel selectedLake={mockLake} />);
    
    // Enter a location
    const locationInput = screen.getByLabelText('Min position');
    fireEvent.change(locationInput, { target: { value: 'Stockholm' } });
    
    // Check that the URL is correct
    const directionsButton = screen.getByText('Visa vägbeskrivning').closest('a');
    expect(directionsButton).toHaveAttribute(
      'href', 
      'https://www.google.com/maps/dir/?api=1&origin=Stockholm&destination=59.3293,18.0686&travelmode=driving'
    );
  });
});
