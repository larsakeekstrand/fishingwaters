import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DrivingDirections from '../DrivingDirections';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock Material UI icons
jest.mock('@mui/icons-material/LocationOn', () => () => <div data-testid="location-icon" />);
jest.mock('@mui/icons-material/Directions', () => () => <div data-testid="directions-icon" />);
jest.mock('@mui/icons-material/MyLocation', () => () => <div data-testid="my-location-icon" />);

describe('DrivingDirections', () => {
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
      location: 'Test Location',
      elevation: 50
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders driving directions form', () => {
    render(<DrivingDirections selectedLake={mockLake} />);
    
    expect(screen.getByText('Vägbeskrivning')).toBeInTheDocument();
    expect(screen.getByLabelText('Startplats')).toBeInTheDocument();
    expect(screen.getByText('Använd min position')).toBeInTheDocument();
    // Use a more flexible approach to find the destination info
    expect(screen.getByText(/Destination:/)).toBeInTheDocument();
    expect(screen.getByText('Test Lake')).toBeInTheDocument();
    expect(screen.getByText('Visa vägbeskrivning')).toBeInTheDocument();
  });

  it('accepts manual input for start location', () => {
    render(<DrivingDirections selectedLake={mockLake} />);
    
    const input = screen.getByLabelText('Startplats');
    fireEvent.change(input, { target: { value: 'Stockholm, Sweden' } });
    
    expect(input).toHaveValue('Stockholm, Sweden');
  });

  it('generates correct Google Maps URL with input location', () => {
    render(<DrivingDirections selectedLake={mockLake} />);
    
    const input = screen.getByLabelText('Startplats');
    fireEvent.change(input, { target: { value: 'Stockholm, Sweden' } });
    
    const button = screen.getByText('Visa vägbeskrivning');
    expect(button).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&origin=Stockholm%2C%20Sweden&destination=59.3293,18.0686&travelmode=driving');
  });

  it('button is disabled when no start location is provided', () => {
    render(<DrivingDirections selectedLake={mockLake} />);
    
    const button = screen.getByText('Visa vägbeskrivning');
    // MUI Link buttons use aria-disabled instead of the disabled attribute
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles geolocation success', async () => {
    // Mock the geolocation API
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success) => {
        success({
          coords: {
            latitude: 60.1282,
            longitude: 18.6435
          }
        });
      })
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });

    render(<DrivingDirections selectedLake={mockLake} />);
    
    const locationButton = screen.getByText('Använd min position');
    fireEvent.click(locationButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Startplats')).toHaveValue('60.1282,18.6435');
    });
    
    const button = screen.getByText('Visa vägbeskrivning');
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&origin=60.1282%2C18.6435&destination=59.3293,18.0686&travelmode=driving');
  });

  it('handles geolocation error', async () => {
    // Mock the geolocation API with an error
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success, error) => {
        error({
          code: 1,
          message: 'User denied geolocation'
        });
      })
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });

    render(<DrivingDirections selectedLake={mockLake} />);
    
    const locationButton = screen.getByText('Använd min position');
    fireEvent.click(locationButton);
    
    await waitFor(() => {
      expect(screen.getByText('Det gick inte att hämta din position. Vänligen ange platsen manuellt.')).toBeInTheDocument();
    });
  });
});