import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeciesFilter from '../SpeciesFilter';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

describe('SpeciesFilter', () => {
  const mockOnFilterChange = jest.fn();

  const createMockFeature = (species: string[] | string): GeoJsonFeature => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [18.0579, 59.3293] as [number, number]
    },
    properties: {
      name: 'Test Lake',
      county: 'Test County',
      location: 'Test Location',
      maxDepth: 10,
      area: 100,
      elevation: 50,
      catchedSpecies: species
    }
  });

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders species list from array data', () => {
    const features = [
      createMockFeature(['Gädda', 'Abborre']),
      createMockFeature(['Gös', 'Abborre'])
    ];

    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);

    // Expand the panel first
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);

    expect(screen.getByText('Filtrera efter arter')).toBeInTheDocument();
    expect(screen.getByText('Abborre')).toBeInTheDocument();
    expect(screen.getByText('Gädda')).toBeInTheDocument();
    expect(screen.getByText('Gös')).toBeInTheDocument();
  });

  it('renders species list from comma-separated string data', () => {
    const features = [
      createMockFeature('Gädda, Abborre'),
      createMockFeature('Gös')
    ];

    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);

    // Expand the panel first
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);

    expect(screen.getByText('Abborre')).toBeInTheDocument();
    expect(screen.getByText('Gädda')).toBeInTheDocument();
    expect(screen.getByText('Gös')).toBeInTheDocument();
  });

  it('handles checkbox changes', () => {
    const features = [createMockFeature(['Gädda', 'Abborre'])];
    
    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);
    
    // Expand the panel first
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    const gaddaCheckbox = screen.getByLabelText('Gädda') as HTMLInputElement;
    fireEvent.click(gaddaCheckbox);
    
    expect(gaddaCheckbox.checked).toBe(true);
    expect(mockOnFilterChange).toHaveBeenCalledWith(new Set(['Gädda']));

    fireEvent.click(gaddaCheckbox);
    expect(gaddaCheckbox.checked).toBe(false);
    expect(mockOnFilterChange).toHaveBeenCalledWith(new Set([]));
  });

  it('handles select all button', () => {
    const features = [createMockFeature(['Gädda', 'Abborre', 'Gös'])];
    
    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);
    
    // Expand the panel first
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    const selectAllButton = screen.getByText('Välj alla');
    fireEvent.click(selectAllButton);

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    checkboxes.forEach(checkbox => {
      expect(checkbox.checked).toBe(true);
    });

    expect(mockOnFilterChange).toHaveBeenCalledWith(new Set(['Abborre', 'Gädda', 'Gös']));
  });

  it('handles clear all button', () => {
    const features = [createMockFeature(['Gädda', 'Abborre', 'Gös'])];
    
    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);
    
    // Expand the panel first
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    // First select all
    fireEvent.click(screen.getByText('Välj alla'));
    mockOnFilterChange.mockClear();

    // Then clear all
    const clearAllButton = screen.getByText('Rensa alla');
    fireEvent.click(clearAllButton);

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    checkboxes.forEach(checkbox => {
      expect(checkbox.checked).toBe(false);
    });

    expect(mockOnFilterChange).toHaveBeenCalledWith(new Set([]));
  });

  it('handles both catchedSpecies and fångadeArter properties', () => {
    const features: GeoJsonFeature[] = [
      {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [18.0579, 59.3293] as [number, number]
        },
        properties: {
          name: 'Test Lake 1',
          county: 'Test County',
          location: 'Test Location',
          maxDepth: 10,
          area: 100,
          elevation: 50,
          catchedSpecies: ['Gädda']
        }
      },
      {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [17.0579, 58.3293] as [number, number]
        },
        properties: {
          name: 'Test Lake 2',
          county: 'Test County',
          location: 'Test Location',
          maxDepth: 10,
          area: 100,
          elevation: 50,
          fångadeArter: ['Abborre']
        }
      }
    ];

    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);

    // Expand the panel first
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);

    expect(screen.getByText('Gädda')).toBeInTheDocument();
    expect(screen.getByText('Abborre')).toBeInTheDocument();
  });

  it('handles features without species data', () => {
    const features: GeoJsonFeature[] = [
      createMockFeature([]),
      {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [18.0579, 59.3293] as [number, number]
        },
        properties: {
          name: 'Test Lake',
          county: 'Test County',
          location: 'Test Location',
          maxDepth: 10,
          area: 100,
          elevation: 50
        }
      }
    ];

    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);
    
    const checkboxes = screen.queryAllByRole('checkbox');
    expect(checkboxes).toHaveLength(0);
  });

  it('starts minimized and can be expanded/collapsed', async () => {
    const features = [createMockFeature(['Gädda', 'Abborre'])];
    
    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);
    
    // Should start minimized - check that checkboxes are not visible
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    
    // Click to expand
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    // Wait for animation and check elements are visible
    await waitFor(() => {
      expect(screen.getByText('Filtrera efter arter')).toBeInTheDocument();
      expect(screen.getByText('Välj alla')).toBeInTheDocument();
      expect(screen.getByText('Rensa alla')).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
    });
    
    // Click to collapse again
    fireEvent.click(expandButton);
    
    // Wait for animation and check elements are hidden
    await waitFor(() => {
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });
  });
});