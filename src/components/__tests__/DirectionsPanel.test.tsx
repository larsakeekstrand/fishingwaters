import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DirectionsPanel from '../DirectionsPanel';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock window.open
const mockOpen = jest.fn();
window.open = mockOpen;

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

describe('DirectionsPanel', () => {
  const mockLake: GeoJsonFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [18.0579, 59.3293] // longitude, latitude
    },
    properties: {
      name: 'Test Lake',
      county: 'Test County',
      maxDepth: 25,
      area: 500
    }
  };

  beforeEach(() => {
    mockOpen.mockClear();
    mockGeolocation.getCurrentPosition.mockClear();
  });

  it('renders correctly with default selection (current location)', () => {
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    // Check if the panel title is rendered
    expect(screen.getByText('Vägbeskrivning')).toBeInTheDocument();
    
    // Check that the "current location" option is selected by default
    const currentLocationRadio = screen.getByLabelText(/Min position/i);
    expect(currentLocationRadio).toBeChecked();
    
    // Check that the manual address option exists
    expect(screen.getByLabelText(/Ange adress/i)).toBeInTheDocument();
    
    // Check that the address input is not visible initially
    expect(screen.queryByPlaceholderText('Ange startadress')).not.toBeInTheDocument();
    
    // Check that the directions button is present
    expect(screen.getByText('Visa vägbeskrivning')).toBeInTheDocument();
  });

  it('shows the address input when manual option is selected', () => {
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    // Select the manual address option
    const manualRadio = screen.getByLabelText(/Ange adress/i);
    fireEvent.click(manualRadio);
    
    // Check that the address input is now visible
    const addressInput = screen.getByPlaceholderText('Ange startadress');
    expect(addressInput).toBeInTheDocument();
    
    // The button should be disabled because no address is entered
    const directionButton = screen.getByText('Visa vägbeskrivning');
    expect(directionButton).toBeDisabled();
    
    // Enter an address
    fireEvent.change(addressInput, { target: { value: 'Stockholm, Sweden' } });
    
    // Now the button should be enabled
    expect(directionButton).not.toBeDisabled();
  });

  it('opens Google Maps with correct URL for manual address', async () => {
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    // Select the manual address option
    const manualRadio = screen.getByLabelText(/Ange adress/i);
    fireEvent.click(manualRadio);
    
    // Enter an address
    const addressInput = screen.getByPlaceholderText('Ange startadress');
    fireEvent.change(addressInput, { target: { value: 'Stockholm, Sweden' } });
    
    // Click the directions button
    const directionButton = screen.getByText('Visa vägbeskrivning');
    fireEvent.click(directionButton);
    
    // Check that window.open was called with the correct URL
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(
        `https://www.google.com/maps/dir/${encodeURIComponent('Stockholm, Sweden')}/59.3293,18.0579`,
        '_blank'
      );
    });
  });

  it('opens Google Maps with geolocation coordinates when current location is selected', async () => {
    // Mock successful geolocation
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({
        coords: {
          latitude: 60.1282,
          longitude: 18.6435
        }
      });
    });
    
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    // Current location should be selected by default
    // Click the directions button
    const directionButton = screen.getByText('Visa vägbeskrivning');
    fireEvent.click(directionButton);
    
    // Check that geolocation was called
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    
    // Check that window.open was called with the correct URL
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/60.1282,18.6435/59.3293,18.0579',
        '_blank'
      );
    });
  });

  it('shows an error when geolocation fails', async () => {
    // Mock geolocation failure
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
      error(new Error('Geolocation error'));
    });
    
    render(<DirectionsPanel selectedLake={mockLake} />);
    
    // Click the directions button
    const directionButton = screen.getByText('Visa vägbeskrivning');
    fireEvent.click(directionButton);
    
    // Check that geolocation was called
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    
    // Check that an error is displayed
    await waitFor(() => {
      expect(screen.getByText(/Kunde inte hämta din position/i)).toBeInTheDocument();
    });
    
    // Check that window.open was not called
    expect(mockOpen).not.toHaveBeenCalled();
  });
});