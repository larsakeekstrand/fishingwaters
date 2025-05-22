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

    expect(screen.getByText('Abborre')).toBeInTheDocument();
    expect(screen.getByText('Gädda')).toBeInTheDocument();
    expect(screen.getByText('Gös')).toBeInTheDocument();
  });

  it('handles checkbox changes', () => {
    const features = [createMockFeature(['Gädda', 'Abborre'])];
    
    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);
    
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

  it('shows minimize/maximize button', () => {
    const features = [createMockFeature(['Gädda', 'Abborre'])];
    
    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);
    
    const minimizeButton = screen.getByLabelText('Dölj filter');
    expect(minimizeButton).toBeInTheDocument();
  });

  it('toggles panel visibility when minimize button is clicked', async () => {
    const features = [createMockFeature(['Gädda', 'Abborre'])];
    
    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);
    
    // Initially the content should be visible
    expect(screen.getByText('Välj alla')).toBeInTheDocument();
    expect(screen.getByText('Rensa alla')).toBeInTheDocument();
    
    // Click minimize button
    const minimizeButton = screen.getByLabelText('Dölj filter');
    fireEvent.click(minimizeButton);
    
    // Wait for the collapse animation and content to be hidden
    await waitFor(() => {
      expect(screen.queryByText('Välj alla')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Rensa alla')).not.toBeInTheDocument();
    
    // Button label should change
    const maximizeButton = screen.getByLabelText('Visa filter');
    expect(maximizeButton).toBeInTheDocument();
  });

  it('shows content again when maximize button is clicked', () => {
    const features = [createMockFeature(['Gädda', 'Abborre'])];
    
    render(<SpeciesFilter features={features} onFilterChange={mockOnFilterChange} />);
    
    // Minimize first
    const minimizeButton = screen.getByLabelText('Dölj filter');
    fireEvent.click(minimizeButton);
    
    // Then maximize
    const maximizeButton = screen.getByLabelText('Visa filter');
    fireEvent.click(maximizeButton);
    
    // Content should be visible again
    expect(screen.getByText('Välj alla')).toBeInTheDocument();
    expect(screen.getByText('Rensa alla')).toBeInTheDocument();
    expect(screen.getByText('Gädda')).toBeInTheDocument();
    expect(screen.getByText('Abborre')).toBeInTheDocument();
  });
});