import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidePanel from '../SidePanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock window.open
const mockOpen = jest.fn();
window.open = mockOpen;

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

  beforeEach(() => {
    mockOpen.mockClear();
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

  it('displays the directions form when a lake is selected', () => {
    render(<SidePanel selectedLake={mockLake} />);

    expect(screen.getByText('Vägbeskrivning')).toBeInTheDocument();
    expect(screen.getByLabelText('Din plats:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ange din startplats')).toBeInTheDocument();
    expect(screen.getByText('Hämta vägbeskrivning')).toBeInTheDocument();
  });

  it('enables the directions button when a location is entered', () => {
    render(<SidePanel selectedLake={mockLake} />);

    const button = screen.getByText('Hämta vägbeskrivning');
    const input = screen.getByLabelText('Din plats:');

    // Button should be disabled initially
    expect(button).toBeDisabled();

    // Enter a location
    fireEvent.change(input, { target: { value: 'Stockholm' } });

    // Button should be enabled
    expect(button).not.toBeDisabled();
  });

  it('opens Google Maps with correct URL when form is submitted', () => {
    render(<SidePanel selectedLake={mockLake} />);

    const button = screen.getByText('Hämta vägbeskrivning');
    const input = screen.getByLabelText('Din plats:');

    // Enter a location
    fireEvent.change(input, { target: { value: 'Stockholm' } });

    // Submit the form
    fireEvent.click(button);

    // Check that window.open was called with the correct URL
    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('https://www.google.com/maps/dir/?api=1&origin=Stockholm&destination=59.3293%2C18.0686'),
      '_blank'
    );
  });
});
