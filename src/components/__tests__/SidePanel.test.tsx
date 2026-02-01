import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
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

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('displays default message when no lake is selected', () => {
    render(<SidePanel selectedLake={null} open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Välj en sjö på kartan för att se mer information')).toBeInTheDocument();
  });

  it('displays lake information when a lake is selected', () => {
    render(<SidePanel selectedLake={mockLake} open={true} onClose={mockOnClose} />);

    expect(screen.getByText('Test Lake')).toBeInTheDocument();
    expect(screen.getByText('10 m')).toBeInTheDocument();
    expect(screen.getByText(/1[,\s]000 ha/)).toBeInTheDocument();
    expect(screen.getByText('Test County')).toBeInTheDocument();
    expect(screen.getByText('Pike, Perch')).toBeInTheDocument();
    expect(screen.getByText('Pike (60%)')).toBeInTheDocument();
    expect(screen.getByText('Perch (40%)')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<SidePanel selectedLake={mockLake} open={true} onClose={mockOnClose} />);

    const closeButton = screen.getByTestId('side-panel-close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  describe('Directions functionality', () => {
    const mockWindowOpen = vi.fn();
    const originalOpen = window.open;

    beforeEach(() => {
      window.open = mockWindowOpen;
      mockWindowOpen.mockClear();
    });

    afterEach(() => {
      window.open = originalOpen;
    });

    it('displays directions section with toggle buttons', () => {
      render(<SidePanel selectedLake={mockLake} open={true} onClose={mockOnClose} />);

      expect(screen.getByText('Vägbeskrivning')).toBeInTheDocument();
      expect(screen.getByText('Min position')).toBeInTheDocument();
      expect(screen.getByText('Ange adress')).toBeInTheDocument();
      expect(screen.getByText('Få vägbeskrivning')).toBeInTheDocument();
    });

    it('shows address input when manual location is selected', () => {
      render(<SidePanel selectedLake={mockLake} open={true} onClose={mockOnClose} />);

      expect(screen.queryByPlaceholderText('Skriv din adress...')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Ange adress'));

      expect(screen.getByPlaceholderText('Skriv din adress...')).toBeInTheDocument();
    });

    it('disables button when manual mode is selected but no address is entered', () => {
      render(<SidePanel selectedLake={mockLake} open={true} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Ange adress'));

      const button = screen.getByText('Få vägbeskrivning').closest('button');
      expect(button).toBeDisabled();

      const input = screen.getByPlaceholderText('Skriv din adress...');
      fireEvent.change(input, { target: { value: 'Test Address' } });

      expect(button).not.toBeDisabled();
    });

    it('opens Google Maps with manual address', () => {
      render(<SidePanel selectedLake={mockLake} open={true} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Ange adress'));

      const input = screen.getByPlaceholderText('Skriv din adress...');
      fireEvent.change(input, { target: { value: 'Stockholm, Sweden' } });

      fireEvent.click(screen.getByText('Få vägbeskrivning'));

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/Stockholm%2C%20Sweden/59.3293,18.0686',
        '_blank'
      );
    });

    it('handles Enter key press in address input', () => {
      render(<SidePanel selectedLake={mockLake} open={true} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Ange adress'));

      const input = screen.getByPlaceholderText('Skriv din adress...');
      fireEvent.change(input, { target: { value: 'Test Address' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockWindowOpen).toHaveBeenCalled();
    });

    it('requests geolocation when using current position', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn()
      };
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true
      });

      render(<SidePanel selectedLake={mockLake} open={true} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Få vägbeskrivning'));

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();

      const successCallback = mockGeolocation.getCurrentPosition.mock.calls[0][0];
      act(() => {
        successCallback({
          coords: {
            latitude: 59.3326,
            longitude: 18.0649
          }
        });
      });

      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://www.google.com/maps/dir/59.3326,18.0649/59.3293,18.0686',
          '_blank'
        );
      });
    });

    it('shows error when geolocation is denied', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn()
      };
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true
      });

      render(<SidePanel selectedLake={mockLake} open={true} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Få vägbeskrivning'));

      const errorCallback = mockGeolocation.getCurrentPosition.mock.calls[0][1];
      act(() => {
        errorCallback({
          code: 1, // PERMISSION_DENIED
          PERMISSION_DENIED: 1
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Åtkomst till plats nekad')).toBeInTheDocument();
      });
    });
  });
});
