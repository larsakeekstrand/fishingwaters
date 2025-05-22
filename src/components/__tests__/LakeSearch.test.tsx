import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LakeSearch from '../LakeSearch';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

describe('LakeSearch', () => {
  const mockOnLakeSelect = jest.fn();

  const createMockLake = (name: string, county: string): GeoJsonFeature => ({
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
      elevation: 50
    }
  });

  beforeEach(() => {
    mockOnLakeSelect.mockClear();
  });

  it('renders search input', () => {
    const features = [createMockLake('Test Lake', 'Test County')];
    
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    expect(screen.getByText('Sök sjö')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Skriv sjönamn...')).toBeInTheDocument();
  });

  it('shows suggestions when typing', () => {
    const features = [
      createMockLake('Vättern', 'Östergötland'),
      createMockLake('Vänern', 'Västra Götaland'),
      createMockLake('Mälaren', 'Stockholm')
    ];
    
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Skriv sjönamn...');
    fireEvent.change(searchInput, { target: { value: 'Vä' } });
    
    expect(screen.getByText('Vättern')).toBeInTheDocument();
    expect(screen.getByText('Vänern')).toBeInTheDocument();
    expect(screen.queryByText('Mälaren')).not.toBeInTheDocument();
  });

  it('limits suggestions to 5 items', () => {
    const features = Array.from({ length: 10 }, (_, i) => 
      createMockLake(`Lake ${i}`, 'Test County')
    );
    
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Skriv sjönamn...');
    fireEvent.change(searchInput, { target: { value: 'Lake' } });
    
    const suggestions = screen.getAllByText(/Lake \d/);
    expect(suggestions).toHaveLength(5);
  });

  it('calls onLakeSelect when clicking a suggestion', () => {
    const lake = createMockLake('Vättern', 'Östergötland');
    const features = [lake];
    
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Skriv sjönamn...');
    fireEvent.change(searchInput, { target: { value: 'Vä' } });
    
    const suggestion = screen.getByText('Vättern');
    fireEvent.click(suggestion);
    
    expect(mockOnLakeSelect).toHaveBeenCalledWith(lake);
  });

  it('updates search input value when selecting a lake', () => {
    const features = [createMockLake('Vättern', 'Östergötland')];
    
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Skriv sjönamn...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Vä' } });
    
    const suggestion = screen.getByText('Vättern');
    fireEvent.click(suggestion);
    
    expect(searchInput.value).toBe('Vättern');
  });

  it('hides suggestions when input is empty', () => {
    const features = [createMockLake('Vättern', 'Östergötland')];
    
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Skriv sjönamn...');
    fireEvent.change(searchInput, { target: { value: 'Vä' } });
    
    expect(screen.getByText('Vättern')).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: '' } });
    
    expect(screen.queryByText('Vättern')).not.toBeInTheDocument();
  });

  it('displays county information in suggestions', () => {
    const features = [createMockLake('Vättern', 'Östergötland')];
    
    render(<LakeSearch features={features} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Skriv sjönamn...');
    fireEvent.change(searchInput, { target: { value: 'Vä' } });
    
    expect(screen.getByText('Östergötland')).toBeInTheDocument();
  });
});