import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DrivingDirections from '../DrivingDirections';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
});

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};
Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
});

describe('DrivingDirections', () => {
  const mockLake: GeoJsonFeature = {
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [18.0579, 59.3293] // lng, lat
    },
    properties: {
      name: 'Test Lake',
      county: 'Test County',
      location: 'Test Location',
      maxDepth: 10,
      area: 100,
      elevation: 50,
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders driving directions interface', () => {
    render(<DrivingDirections selectedLake={mockLake} />);

    expect(screen.getByText('Vägbeskrivning')).toBeInTheDocument();
    expect(screen.getByText('Få vägbeskrivning till Test Lake')).toBeInTheDocument();
    expect(screen.getByText('Använd min nuvarande position')).toBeInTheDocument();
    expect(screen.getByText('Visa vägbeskrivning')).toBeInTheDocument();
  });

  it('has current location toggle enabled by default', () => {
    render(<DrivingDirections selectedLake={mockLake} />);

    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeChecked();
  });

  it('shows address input when current location is disabled', () => {
    render(<DrivingDirections selectedLake={mockLake} />);

    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    expect(screen.getByPlaceholderText('Ange startadress...')).toBeInTheDocument();
  });

  it('disables button when address input is empty', () => {
    render(<DrivingDirections selectedLake={mockLake} />);

    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    const button = screen.getByRole('button', { name: /visa vägbeskrivning/i });
    expect(button).toBeDisabled();
  });

  it('enables button when address is entered', async () => {
    const user = userEvent.setup();
    render(<DrivingDirections selectedLake={mockLake} />);

    const toggle = screen.getByRole('checkbox');
    await user.click(toggle);

    const addressInput = screen.getByPlaceholderText('Ange startadress...');
    await user.type(addressInput, 'Stockholm');

    const button = screen.getByRole('button', { name: /visa vägbeskrivning/i });
    expect(button).not.toBeDisabled();
  });

  it('opens Google Maps with current location', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 59.3293,
          longitude: 18.0686,
        },
      });
    });

    render(<DrivingDirections selectedLake={mockLake} />);

    const button = screen.getByRole('button', { name: /visa vägbeskrivning/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/59.3293,18.0686/59.3293,18.0579',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  it('opens Google Maps with custom address', async () => {
    const user = userEvent.setup();
    render(<DrivingDirections selectedLake={mockLake} />);

    const toggle = screen.getByRole('checkbox');
    await user.click(toggle);

    const addressInput = screen.getByPlaceholderText('Ange startadress...');
    await user.type(addressInput, 'Stockholm Central');

    const button = screen.getByRole('button', { name: /visa vägbeskrivning/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/Stockholm%20Central/59.3293,18.0579',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  it('shows error when geolocation fails', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({
        code: 1, // PERMISSION_DENIED
        message: 'Permission denied',
      });
    });

    render(<DrivingDirections selectedLake={mockLake} />);

    const button = screen.getByRole('button', { name: /visa vägbeskrivning/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Åtkomst till din position nekades. Använd istället en adress.')).toBeInTheDocument();
    });
  });

  it('shows error when address is empty', async () => {
    const user = userEvent.setup();
    render(<DrivingDirections selectedLake={mockLake} />);

    const toggle = screen.getByRole('checkbox');
    await user.click(toggle);

    // Try to click button without entering address (should be disabled, but let's test error handling)
    const addressInput = screen.getByPlaceholderText('Ange startadress...');
    await user.type(addressInput, '   '); // spaces only

    const button = screen.getByRole('button', { name: /visa vägbeskrivning/i });
    expect(button).toBeDisabled();
  });

  it('clears errors when switching between input modes', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({
        code: 1, // PERMISSION_DENIED
        message: 'Permission denied',
      });
    });

    render(<DrivingDirections selectedLake={mockLake} />);

    // Trigger error with geolocation
    const button = screen.getByRole('button', { name: /visa vägbeskrivning/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Åtkomst till din position nekades. Använd istället en adress.')).toBeInTheDocument();
    });

    // Switch to address input - error should clear
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    expect(screen.queryByText('Åtkomst till din position nekades. Använd istället en adress.')).not.toBeInTheDocument();
  });
});