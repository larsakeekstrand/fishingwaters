import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DirectionsPanel from '../DirectionsPanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock window.open
const mockOpen = jest.fn();
window.open = mockOpen;

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};
(global as any).navigator.geolocation = mockGeolocation;

describe('DirectionsPanel', () => {
  const mockLake: GeoJsonFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [18.0686, 59.3293] // [longitude, latitude]
    },
    properties: {
      name: 'Test Lake',
      county: 'Test County',
      location: 'Test Location',
      maxDepth: 10,
      area: 1000,
      elevation: 50
    }
  };

  beforeEach(() => {
    mockOpen.mockClear();
    mockGeolocation.getCurrentPosition.mockClear();
  });

  it('renders collapsed by default', () => {
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    expect(screen.getByText('Driving Directions')).toBeInTheDocument();
    // Check that the collapse element has the hidden class
    const collapseEl = screen.getByText('Directions will open in Google Maps.').closest('.MuiCollapse-hidden');
    expect(collapseEl).toBeTruthy();
  });

  it('expands when clicked', () => {
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    // Click the header to expand
    fireEvent.click(screen.getByText('Driving Directions'));
    
    // Verify the collapse is no longer hidden
    expect(screen.queryByText('Directions will open in Google Maps.').closest('.MuiCollapse-hidden')).toBeFalsy();
    expect(screen.getByText('Use my current location')).toBeInTheDocument();
    expect(screen.getByText('Get Directions')).toBeInTheDocument();
  });

  it('allows entering a starting location', () => {
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    // Expand the panel
    fireEvent.click(screen.getByText('Driving Directions'));
    
    const input = screen.getByLabelText('Enter your starting location');
    fireEvent.change(input, { target: { value: 'Stockholm, Sweden' } });
    
    expect(input).toHaveValue('Stockholm, Sweden');
  });

  it('opens Google Maps with address when Get Directions is clicked', () => {
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    // Expand the panel
    fireEvent.click(screen.getByText('Driving Directions'));
    
    // Enter starting location
    const input = screen.getByLabelText('Enter your starting location');
    fireEvent.change(input, { target: { value: 'Stockholm, Sweden' } });
    
    // Click Get Directions
    fireEvent.click(screen.getByText('Get Directions'));
    
    // Check if window.open was called with the correct URL
    expect(mockOpen).toHaveBeenCalledWith(
      'https://www.google.com/maps/dir/?api=1&origin=Stockholm%2C%20Sweden&destination=59.3293,18.0686&travelmode=driving',
      '_blank'
    );
  });

  it('toggles to use current location when switch is clicked', () => {
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    // Expand the panel
    fireEvent.click(screen.getByText('Driving Directions'));
    
    // Toggle to use current location
    const toggle = screen.getByLabelText('Use my current location');
    fireEvent.click(toggle);
    
    // Check that the input is no longer visible
    expect(screen.queryByLabelText('Enter your starting location')).not.toBeInTheDocument();
    expect(screen.getByText('Get My Location')).toBeInTheDocument();
  });

  it('uses geolocation when Get My Location is clicked', () => {
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    // Expand the panel
    fireEvent.click(screen.getByText('Driving Directions'));
    
    // Toggle to use current location
    const toggle = screen.getByLabelText('Use my current location');
    fireEvent.click(toggle);
    
    // Click Get My Location
    fireEvent.click(screen.getByText('Get My Location'));
    
    // Check if getCurrentPosition was called
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('handles successful geolocation', async () => {
    // Mock successful geolocation
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({ coords: { latitude: 60.1282, longitude: 18.6435 } });
    });
    
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    // Expand the panel
    fireEvent.click(screen.getByText('Driving Directions'));
    
    // Toggle to use current location
    const toggle = screen.getByLabelText('Use my current location');
    fireEvent.click(toggle);
    
    // Click Get My Location
    fireEvent.click(screen.getByText('Get My Location'));
    
    // Check if window.open was called with the correct URL
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/?api=1&origin=60.1282,18.6435&destination=59.3293,18.0686&travelmode=driving',
        '_blank'
      );
    });
  });
});