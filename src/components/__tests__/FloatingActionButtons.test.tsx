import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import FloatingActionButtons from '../FloatingActionButtons';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

describe('FloatingActionButtons', () => {
  const mockFeatures: GeoJsonFeature[] = [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [18.0686, 59.3293] },
      properties: {
        name: 'Test Lake',
        county: 'Test County',
        maxDepth: 10,
        area: 1000,
        catchedSpecies: ['Pike', 'Perch'],
      },
    },
  ];

  const defaultProps = {
    features: mockFeatures,
    onFilterChange: vi.fn(),
    selectedSpecies: new Set<string>(),
    onRadiusSearch: vi.fn(),
    showBoatRamps: false,
    onBoatRampsToggle: vi.fn(),
    onReset: vi.fn(),
    hasActiveFilters: false,
  };

  beforeEach(() => {
    defaultProps.onFilterChange.mockClear();
    defaultProps.onRadiusSearch.mockClear();
    defaultProps.onBoatRampsToggle.mockClear();
    defaultProps.onReset.mockClear();
  });

  it('renders three FABs', () => {
    render(<FloatingActionButtons {...defaultProps} />);

    expect(screen.getByLabelText('Närliggande')).toBeInTheDocument();
    expect(screen.getByLabelText('Artfilter')).toBeInTheDocument();
    expect(screen.getByLabelText('Båtramper')).toBeInTheDocument();
  });

  it('renders the floating action buttons container', () => {
    render(<FloatingActionButtons {...defaultProps} />);

    expect(screen.getByTestId('floating-action-buttons')).toBeInTheDocument();
  });

  it('shows badge with species count when species are selected', () => {
    const selectedSpecies = new Set(['Pike', 'Perch']);
    render(<FloatingActionButtons {...defaultProps} selectedSpecies={selectedSpecies} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('toggles boat ramps on FAB click', () => {
    render(<FloatingActionButtons {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Båtramper'));

    expect(defaultProps.onBoatRampsToggle).toHaveBeenCalledWith(true);
  });

  it('toggles boat ramps off when already active', () => {
    render(<FloatingActionButtons {...defaultProps} showBoatRamps={true} />);

    fireEvent.click(screen.getByLabelText('Båtramper'));

    expect(defaultProps.onBoatRampsToggle).toHaveBeenCalledWith(false);
  });

  it('does not show reset FAB when no active filters', () => {
    render(<FloatingActionButtons {...defaultProps} />);

    expect(screen.queryByLabelText('Återställ')).not.toBeInTheDocument();
  });

  it('shows reset FAB and calls onReset when active filters exist', () => {
    render(<FloatingActionButtons {...defaultProps} hasActiveFilters={true} />);

    const resetButton = screen.getByLabelText('Återställ');
    expect(resetButton).toBeInTheDocument();

    fireEvent.click(resetButton);
    expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
  });
});
