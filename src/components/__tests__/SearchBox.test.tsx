import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

describe('SearchBox', () => {
  const mockFeatures: GeoJsonFeature[] = [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [18.0686, 59.3293]
      },
      properties: {
        name: 'Mälaren',
        county: 'Stockholm',
        location: 'Test Location',
        maxDepth: 10,
        area: 1000,
        elevation: 50
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [17.0686, 58.3293]
      },
      properties: {
        name: 'Vättern',
        county: 'Jönköping',
        location: 'Test Location',
        maxDepth: 20,
        area: 2000,
        elevation: 40
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [16.0686, 57.3293]
      },
      properties: {
        name: 'Vänern',
        county: 'Västra Götaland',
        location: 'Test Location',
        maxDepth: 30,
        area: 3000,
        elevation: 30
      }
    }
  ];

  const mockOnLakeSelect = jest.fn();

  it('renders the search box', () => {
    render(<SearchBox features={mockFeatures} onLakeSelect={mockOnLakeSelect} />);
    
    expect(screen.getByPlaceholderText('Sök efter sjöar...')).toBeInTheDocument();
    expect(screen.getByLabelText('search')).toBeInTheDocument();
  });

  it('shows suggestions when typing', () => {
    render(<SearchBox features={mockFeatures} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Sök efter sjöar...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'v' } });
    
    expect(screen.getByText('Vättern')).toBeInTheDocument();
    expect(screen.getByText('Vänern')).toBeInTheDocument();
  });

  it('shows no results when no matches are found', () => {
    render(<SearchBox features={mockFeatures} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Sök efter sjöar...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'xyz' } });
    
    // This assertion might be tricky since the "No results" element might not be in the DOM when no matches are found
    // You might want to check for the absence of lake names instead
    expect(screen.queryByText('Mälaren')).not.toBeInTheDocument();
    expect(screen.queryByText('Vättern')).not.toBeInTheDocument();
    expect(screen.queryByText('Vänern')).not.toBeInTheDocument();
  });

  it('calls onLakeSelect when a suggestion is clicked', () => {
    render(<SearchBox features={mockFeatures} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Sök efter sjöar...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'm' } });
    
    fireEvent.click(screen.getByText('Mälaren'));
    
    expect(mockOnLakeSelect).toHaveBeenCalledWith(mockFeatures[0]);
  });

  it('clears the search when clear button is clicked', () => {
    render(<SearchBox features={mockFeatures} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Sök efter sjöar...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(searchInput.value).toBe('test');
    
    fireEvent.click(screen.getByLabelText('clear search'));
    
    expect(searchInput.value).toBe('');
  });
});