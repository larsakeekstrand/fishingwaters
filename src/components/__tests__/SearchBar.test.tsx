import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';
import { GeoJsonFeature } from '../../types/GeoJsonTypes';

describe('SearchBar', () => {
  const mockLakes: GeoJsonFeature[] = [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [15.0, 59.0]
      },
      properties: {
        name: 'Vänern',
        maxDepth: 106,
        area: 565800,
        county: 'Västra Götaland',
        catchedSpecies: ['Abborre', 'Gädda'],
        fångadeArter: null,
        vanlArt: 'Abborre',
        vanlArtWProc: 45,
        nästVanlArt: 'Gädda',
        nästVanlArtWProc: 30,
        senasteFiskeår: '2023'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [14.5, 58.5]
      },
      properties: {
        name: 'Vättern',
        maxDepth: 128,
        area: 189300,
        county: 'Jönköping',
        catchedSpecies: ['Röding', 'Öring'],
        fångadeArter: null,
        vanlArt: 'Röding',
        vanlArtWProc: 55,
        nästVanlArt: 'Öring',
        nästVanlArtWProc: 25,
        senasteFiskeår: '2023'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [16.0, 60.0]
      },
      properties: {
        name: 'Mälaren',
        maxDepth: 64,
        area: 112000,
        county: 'Stockholm',
        catchedSpecies: ['Gös', 'Abborre'],
        fångadeArter: null,
        vanlArt: 'Gös',
        vanlArtWProc: 40,
        nästVanlArt: 'Abborre',
        nästVanlArtWProc: 35,
        senasteFiskeår: '2023'
      }
    }
  ];

  const mockOnLakeSelect = jest.fn();

  beforeEach(() => {
    mockOnLakeSelect.mockClear();
  });

  test('renders search input with placeholder', () => {
    render(<SearchBar lakes={mockLakes} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Sök efter sjö...');
    expect(searchInput).toBeInTheDocument();
  });

  test('shows suggestions when typing', async () => {
    const user = userEvent.setup();
    render(<SearchBar lakes={mockLakes} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Sök efter sjö...');
    await user.type(searchInput, 'vä');
    
    await waitFor(() => {
      expect(screen.getByText('Vänern')).toBeInTheDocument();
      expect(screen.getByText('Vättern')).toBeInTheDocument();
    });
  });

  test('filters suggestions based on input', async () => {
    const user = userEvent.setup();
    render(<SearchBar lakes={mockLakes} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Sök efter sjö...');
    await user.type(searchInput, 'mäl');
    
    await waitFor(() => {
      expect(screen.getByText('Mälaren')).toBeInTheDocument();
      expect(screen.queryByText('Vänern')).not.toBeInTheDocument();
      expect(screen.queryByText('Vättern')).not.toBeInTheDocument();
    });
  });


  test('calls onLakeSelect when selecting a lake', async () => {
    const user = userEvent.setup();
    render(<SearchBar lakes={mockLakes} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Sök efter sjö...');
    await user.type(searchInput, 'vänern');
    
    await waitFor(() => {
      expect(screen.getByText('Vänern')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Vänern'));
    
    expect(mockOnLakeSelect).toHaveBeenCalledWith(mockLakes[0]);
  });

  test('shows no results message when no matches found', async () => {
    const user = userEvent.setup();
    render(<SearchBar lakes={mockLakes} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Sök efter sjö...');
    await user.type(searchInput, 'xyz');
    
    await waitFor(() => {
      expect(screen.getByText('Ingen sjö hittades')).toBeInTheDocument();
    });
  });

  test('displays county information in suggestions', async () => {
    const user = userEvent.setup();
    render(<SearchBar lakes={mockLakes} onLakeSelect={mockOnLakeSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Sök efter sjö...');
    await user.type(searchInput, 'vänern');
    
    await waitFor(() => {
      expect(screen.getByText('Västra Götaland')).toBeInTheDocument();
    });
  });
});