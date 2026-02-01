import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import FloatingSearchBar from '../FloatingSearchBar';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

describe('FloatingSearchBar', () => {
  const mockLakes: GeoJsonFeature[] = [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [18.0686, 59.3293] },
      properties: {
        name: 'Vättern',
        county: 'Jönköping',
        maxDepth: 128,
        area: 188200,
        catchedSpecies: ['Gädda', 'Abborre'],
      },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [14.8, 58.9] },
      properties: {
        name: 'Vänern',
        county: 'Värmland',
        maxDepth: 106,
        area: 548600,
        catchedSpecies: ['Lax', 'Öring'],
      },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [16.5, 59.5] },
      properties: {
        name: 'Mälaren',
        county: 'Stockholm',
        maxDepth: 64,
        area: 112000,
        catchedSpecies: ['Gös', 'Abborre'],
      },
    },
  ];

  const mockOnLakeSelect = vi.fn();

  beforeEach(() => {
    mockOnLakeSelect.mockClear();
  });

  it('renders a search input', () => {
    render(<FloatingSearchBar lakes={mockLakes} onLakeSelect={mockOnLakeSelect} />);

    expect(screen.getByPlaceholderText('Sök sjö...')).toBeInTheDocument();
  });

  it('renders the floating search bar container', () => {
    render(<FloatingSearchBar lakes={mockLakes} onLakeSelect={mockOnLakeSelect} />);

    expect(screen.getByTestId('floating-search-bar')).toBeInTheDocument();
  });

  it('filters options based on input', async () => {
    render(<FloatingSearchBar lakes={mockLakes} onLakeSelect={mockOnLakeSelect} />);

    const input = screen.getByPlaceholderText('Sök sjö...');

    // Focus and type to trigger MUI Autocomplete's onInputChange
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Vät' } });

    await waitFor(() => {
      expect(screen.getByText('Vättern')).toBeInTheDocument();
    });
    expect(screen.queryByText('Mälaren')).not.toBeInTheDocument();
  });

  it('calls onLakeSelect when an option is selected', async () => {
    render(<FloatingSearchBar lakes={mockLakes} onLakeSelect={mockOnLakeSelect} />);

    const input = screen.getByPlaceholderText('Sök sjö...');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Vättern' } });

    await waitFor(() => {
      expect(screen.getByText('Vättern')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Vättern'));

    expect(mockOnLakeSelect).toHaveBeenCalledWith(mockLakes[0]);
  });
});
