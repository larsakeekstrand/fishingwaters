import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LakeSearch from '../LakeSearch';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

describe('LakeSearch', () => {
  const mockOnLakeSelect = jest.fn();

  const createMockFeature = (name: string, county: string): GeoJsonFeature => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [18.0579, 59.3293] as [number, number]
    },
    properties: {
      name,
      county,
      location: 'Test Location',
      maxDepth: 10,
      area: 100,
      elevation: 50,
      catchedSpecies: []
    }
  });

  const features: GeoJsonFeature[] = [
    createMockFeature('Vättern', 'Jönköpings län'),
    createMockFeature('Vänern', 'Västra Götalands län'),
    createMockFeature('Mälaren', 'Stockholms län'),
    createMockFeature('Hjälmaren', 'Örebro län')
  ];

  beforeEach(() => {
    mockOnLakeSelect.mockClear();
  });

  it('renders search input', () => {
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    expect(screen.getByText('Sök sjö')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Skriv sjönamn...')).toBeInTheDocument();
  });

  it('shows autocomplete suggestions when typing', async () => {
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const input = screen.getByPlaceholderText('Skriv sjönamn...');
    
    // Type "vä" to search for lakes starting with "Vä"
    await userEvent.type(input, 'vä');
    
    // Wait for autocomplete to show options
    await waitFor(() => {
      expect(screen.getByText('Vättern')).toBeInTheDocument();
      expect(screen.getByText('Vänern')).toBeInTheDocument();
    });
    
    // Mälaren and Hjälmaren should not be visible
    expect(screen.queryByText('Mälaren')).not.toBeInTheDocument();
    expect(screen.queryByText('Hjälmaren')).not.toBeInTheDocument();
  });

  it('calls onLakeSelect when a lake is selected', async () => {
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const input = screen.getByPlaceholderText('Skriv sjönamn...');
    
    // Type to open autocomplete
    await userEvent.type(input, 'mäl');
    
    // Wait for and click on Mälaren
    await waitFor(() => {
      expect(screen.getByText('Mälaren')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Mälaren'));
    
    expect(mockOnLakeSelect).toHaveBeenCalledWith(features[2]); // Mälaren is at index 2
  });

  it('shows county information in suggestions', async () => {
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const input = screen.getByPlaceholderText('Skriv sjönamn...');
    
    await userEvent.type(input, 'vättern');
    
    await waitFor(() => {
      expect(screen.getByText('Vättern')).toBeInTheDocument();
      expect(screen.getByText('Jönköpings län')).toBeInTheDocument();
    });
  });

  it('shows no options message when no matches found', async () => {
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const input = screen.getByPlaceholderText('Skriv sjönamn...');
    
    await userEvent.type(input, 'xyz');
    
    await waitFor(() => {
      expect(screen.getByText('Ingen sjö hittades')).toBeInTheDocument();
    });
  });

  it('retains selected value after selection', async () => {
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const input = screen.getByPlaceholderText('Skriv sjönamn...') as HTMLInputElement;
    
    // Type and select Vänern
    await userEvent.type(input, 'vänern');
    
    await waitFor(() => {
      expect(screen.getByText('Vänern')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Vänern'));
    
    // Check that the input now shows the selected value
    await waitFor(() => {
      expect(input.value).toBe('Vänern');
    });
  });

  it('sorts lakes alphabetically', async () => {
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const input = screen.getByPlaceholderText('Skriv sjönamn...');
    
    // Click to open all options
    fireEvent.mouseDown(input);
    
    // Wait for options to appear
    await waitFor(() => {
      // Check that all lakes are displayed
      expect(screen.getByText('Hjälmaren')).toBeInTheDocument();
      expect(screen.getByText('Mälaren')).toBeInTheDocument();
      expect(screen.getByText('Vänern')).toBeInTheDocument();
      expect(screen.getByText('Vättern')).toBeInTheDocument();
    });
    
    // Get all lake option elements (they are in li elements)
    const optionElements = screen.getAllByRole('option');
    const lakeNames = optionElements.map(el => el.textContent?.split(/Jönköpings län|Västra Götalands län|Stockholms län|Örebro län/)[0]?.trim());
    
    // Check they are sorted alphabetically
    expect(lakeNames).toEqual(['Hjälmaren', 'Mälaren', 'Vänern', 'Vättern']);
  });
});