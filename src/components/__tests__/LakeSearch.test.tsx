import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import LakeSearch from '../LakeSearch';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

const theme = createTheme();

const mockFeatures: GeoJsonFeature[] = [
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [15.0, 62.0]
    },
    properties: {
      name: 'Vättern',
      county: 'Östergötland',
      sjö: 'Vättern',
      län: 'Östergötland'
    }
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [14.0, 59.0]
    },
    properties: {
      name: 'Vänern',
      county: 'Västra Götaland',
      sjö: 'Vänern',
      län: 'Västra Götaland'
    }
  }
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('LakeSearch', () => {
  const mockOnLakeSelect = jest.fn();
  const mockOnMapRefocus = jest.fn();

  beforeEach(() => {
    mockOnLakeSelect.mockClear();
    mockOnMapRefocus.mockClear();
  });

  test('renders search input', () => {
    renderWithTheme(
      <LakeSearch
        features={mockFeatures}
        onLakeSelect={mockOnLakeSelect}
        onMapRefocus={mockOnMapRefocus}
      />
    );

    expect(screen.getByPlaceholderText('Sök efter sjö...')).toBeInTheDocument();
  });

  test('shows lake suggestions when typing', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <LakeSearch
        features={mockFeatures}
        onLakeSelect={mockOnLakeSelect}
        onMapRefocus={mockOnMapRefocus}
      />
    );

    const searchInput = screen.getByPlaceholderText('Sök efter sjö...');
    await user.type(searchInput, 'Vät');

    await waitFor(() => {
      expect(screen.getByText('Vättern')).toBeInTheDocument();
    });
  });

  test('calls onLakeSelect and onMapRefocus when lake is selected', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <LakeSearch
        features={mockFeatures}
        onLakeSelect={mockOnLakeSelect}
        onMapRefocus={mockOnMapRefocus}
      />
    );

    const searchInput = screen.getByPlaceholderText('Sök efter sjö...');
    await user.type(searchInput, 'Vättern');

    await waitFor(() => {
      expect(screen.getByText('Vättern')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Vättern'));

    expect(mockOnLakeSelect).toHaveBeenCalledWith(mockFeatures[0]);
    expect(mockOnMapRefocus).toHaveBeenCalledWith([62.0, 15.0]);
  });

  test('displays county information in suggestions', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <LakeSearch
        features={mockFeatures}
        onLakeSelect={mockOnLakeSelect}
        onMapRefocus={mockOnMapRefocus}
      />
    );

    const searchInput = screen.getByPlaceholderText('Sök efter sjö...');
    await user.type(searchInput, 'V');

    await waitFor(() => {
      expect(screen.getByText('Östergötland')).toBeInTheDocument();
      expect(screen.getByText('Västra Götaland')).toBeInTheDocument();
    });
  });
});