import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidePanel from '../SidePanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock the geolocation API
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

// Mock the fetch API
global.fetch = jest.fn();

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
    // Setup geolocation mock
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });

    // Reset mocks
    jest.clearAllMocks();
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

  it('displays driving directions section with button', () => {
    render(<SidePanel selectedLake={mockLake} />);

    expect(screen.getByText('Körsträcka')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Beräkna körsträcka' })).toBeInTheDocument();
  });

  it('requests user location when button is clicked', () => {
    render(<SidePanel selectedLake={mockLake} />);

    const button = screen.getByRole('button', { name: 'Beräkna körsträcka' });
    fireEvent.click(button);

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('shows loading state while calculating distance', () => {
    render(<SidePanel selectedLake={mockLake} />);

    const button = screen.getByRole('button', { name: 'Beräkna körsträcka' });
    fireEvent.click(button);

    expect(button).toHaveTextContent('Beräknar...');
    expect(button).toBeDisabled();
  });

  it('displays driving distance when calculation is successful', async () => {
    // Mock successful geolocation
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({ coords: { latitude: 59.3293, longitude: 18.0686 } });
    });

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              summary: {
                distance: 15000, // 15 km in meters
                duration: 1800 // 30 minutes in seconds
              }
            }
          }
        ]
      })
    });

    render(<SidePanel selectedLake={mockLake} />);

    const button = screen.getByRole('button', { name: 'Beräkna körsträcka' });
    fireEvent.click(button);

    // Wait for the async operations to complete
    await screen.findByText(/Avstånd från din position/i);

    expect(screen.getByText(/15.0 km \(ca 30 minuter\)/i)).toBeInTheDocument();
  });

  it('displays error message when geolocation fails', () => {
    // Mock geolocation error
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
      error({ message: 'User denied geolocation' });
    });

    render(<SidePanel selectedLake={mockLake} />);

    const button = screen.getByRole('button', { name: 'Beräkna körsträcka' });
    fireEvent.click(button);

    expect(screen.getByText(/Det gick inte att hämta din position: User denied geolocation/i)).toBeInTheDocument();
  });
});
