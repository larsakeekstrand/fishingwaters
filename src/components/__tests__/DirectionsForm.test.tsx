import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DirectionsForm from '../DirectionsForm';

// Mock window.open
const mockOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen
});

describe('DirectionsForm', () => {
  const mockProps = {
    destinationCoords: [18.123456, 59.123456] as [number, number], // [longitude, latitude]
    destinationName: 'Test Lake'
  };

  beforeEach(() => {
    mockOpen.mockClear();
  });

  it('renders correctly with destination information', () => {
    render(<DirectionsForm {...mockProps} />);
    
    expect(screen.getByText(`Hitta vägen till ${mockProps.destinationName}`)).toBeInTheDocument();
    expect(screen.getByLabelText('Din plats')).toBeInTheDocument();
    expect(screen.getByText('Visa vägbeskrivning')).toBeInTheDocument();
  });

  it('does not render when destination is null', () => {
    const { container } = render(
      <DirectionsForm destinationCoords={null} destinationName={null} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('updates input value when typing', () => {
    render(<DirectionsForm {...mockProps} />);
    
    const input = screen.getByLabelText('Din plats');
    fireEvent.change(input, { target: { value: 'Stockholm' } });
    
    expect(input).toHaveValue('Stockholm');
  });

  it('enables the button when input has a value', () => {
    render(<DirectionsForm {...mockProps} />);
    
    const button = screen.getByText('Visa vägbeskrivning');
    expect(button).toBeDisabled();
    
    const input = screen.getByLabelText('Din plats');
    fireEvent.change(input, { target: { value: 'Stockholm' } });
    
    expect(button).not.toBeDisabled();
  });

  it('opens Google Maps with correct parameters when clicking the button', () => {
    render(<DirectionsForm {...mockProps} />);
    
    const input = screen.getByLabelText('Din plats');
    fireEvent.change(input, { target: { value: 'Stockholm' } });
    
    const button = screen.getByText('Visa vägbeskrivning');
    fireEvent.click(button);
    
    // Note: Google Maps expects coordinates as "latitude,longitude"
    const expectedDestination = `${mockProps.destinationCoords[1]},${mockProps.destinationCoords[0]}`;
    const expectedUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('Stockholm')}&destination=${encodeURIComponent(expectedDestination)}`;
    
    expect(mockOpen).toHaveBeenCalledWith(expectedUrl, '_blank');
  });
});