import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Map from '../Map';
import { GeoJsonCollection, GeoJsonFeature } from '../../types/GeoJsonTypes';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({ children, pathOptions }: { 
    children: React.ReactNode, 
    pathOptions: { fillColor: string }
  }) => (
    <div 
      data-testid="circle-marker" 
      data-fill-color={pathOptions.fillColor}
    >
      {children}
    </div>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
}));

describe('Map', () => {
  const createMockFeature = (
    name: string,
    coordinates: [number, number],
    species?: string[] | string
  ): GeoJsonFeature => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: coordinates
    },
    properties: {
      name,
      county: 'Test County',
      location: 'Test Location',
      maxDepth: 10,
      area: 100,
      elevation: 50,
      catchedSpecies: species
    }
  });

  const createMockData = (features: GeoJsonFeature[]): GeoJsonCollection => ({
    type: 'FeatureCollection',
    features
  });

  it('renders map with all features when no species filter is applied', () => {
    const features = [
      createMockFeature('Lake 1', [18.0579, 59.3293], ['Gädda', 'Abborre']),
      createMockFeature('Lake 2', [17.0579, 58.3293], ['Gös', 'Abborre'])
    ];
    const data = createMockData(features);

    render(<Map data={data} filteredSpecies={new Set()} />);

    const markers = screen.getAllByTestId('circle-marker');
    expect(markers).toHaveLength(2);

    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips[0]).toHaveTextContent('Lake 1');
    expect(tooltips[1]).toHaveTextContent('Lake 2');
  });

  it('filters features based on selected species', () => {
    const features = [
      createMockFeature('Lake 1', [18.0579, 59.3293], ['Gädda', 'Abborre']),
      createMockFeature('Lake 2', [17.0579, 58.3293], ['Gös', 'Abborre'])
    ];
    const data = createMockData(features);

    render(<Map data={data} filteredSpecies={new Set(['Gädda'])} />);

    const markers = screen.getAllByTestId('circle-marker');
    expect(markers).toHaveLength(1);

    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips[0]).toHaveTextContent('Lake 1');
  });

  it('handles comma-separated species strings', () => {
    const features = [
      createMockFeature('Lake 1', [18.0579, 59.3293], 'Gädda, Abborre'),
      createMockFeature('Lake 2', [17.0579, 58.3293], 'Gös, Abborre')
    ];
    const data = createMockData(features);

    render(<Map data={data} filteredSpecies={new Set(['Gädda'])} />);

    const markers = screen.getAllByTestId('circle-marker');
    expect(markers).toHaveLength(1);

    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips[0]).toHaveTextContent('Lake 1');
  });

  it('handles both catchedSpecies and fångadeArter properties', () => {
    const features: GeoJsonFeature[] = [
      {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [18.0579, 59.3293]
        },
        properties: {
          name: 'Lake 1',
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
          coordinates: [17.0579, 58.3293]
        },
        properties: {
          name: 'Lake 2',
          county: 'Test County',
          location: 'Test Location',
          maxDepth: 10,
          area: 100,
          elevation: 50,
          fångadeArter: ['Abborre']
        }
      }
    ];
    const data = createMockData(features);

    render(<Map data={data} filteredSpecies={new Set(['Gädda'])} />);

    const markers = screen.getAllByTestId('circle-marker');
    expect(markers).toHaveLength(1);

    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips[0]).toHaveTextContent('Lake 1');
  });

  it('displays correct tooltip information', () => {
    const feature: GeoJsonFeature = {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [18.0579, 59.3293]
      },
      properties: {
        name: 'Test Lake',
        county: 'Test County',
        location: 'Test Location',
        maxDepth: 10,
        area: 100,
        elevation: 50,
        catchedSpecies: ['Gädda', 'Abborre'],
        vanlArt: 'Gädda',
        nästVanlArt: 'Abborre'
      }
    };
    const data = createMockData([feature]);

    render(<Map data={data} filteredSpecies={new Set()} />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveTextContent('Test Lake');
    expect(tooltip).toHaveTextContent('Maxdjup: 10 m');
    expect(tooltip).toHaveTextContent('Area: 100 ha');
    expect(tooltip).toHaveTextContent('Test County');
    expect(tooltip).toHaveTextContent('Gädda, Abborre');
    expect(tooltip).toHaveTextContent('Vanligaste art: Gädda');
    expect(tooltip).toHaveTextContent('Näst vanligaste art: Abborre');
  });

  it('displays species percentages in tooltip', () => {
    const feature: GeoJsonFeature = {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [18.0579, 59.3293]
      },
      properties: {
        name: 'Test Lake',
        county: 'Test County',
        location: 'Test Location',
        maxDepth: 10,
        area: 100,
        elevation: 50,
        catchedSpecies: ['Gädda', 'Abborre'],
        vanlArt: 'Gädda',
        vanlArtWProc: 45,
        nästVanlArt: 'Abborre',
        nästVanlArtWProc: 30
      }
    };
    const data = createMockData([feature]);

    render(<Map data={data} filteredSpecies={new Set()} />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveTextContent('Vanligaste art: Gädda (45%)');
    expect(tooltip).toHaveTextContent('Näst vanligaste art: Abborre (30%)');
  });

  it('renders all markers in blue color when no filter is applied', () => {
    const features = [
      createMockFeature('Lake 1', [18.0579, 59.3293], ['Gädda', 'Abborre']),
      createMockFeature('Lake 2', [17.0579, 58.3293], ['Gös', 'Abborre'])
    ];
    const data = createMockData(features);

    render(<Map data={data} filteredSpecies={new Set()} />);

    const markers = screen.getAllByTestId('circle-marker');
    expect(markers).toHaveLength(2);

    // Check that all markers have blue color
    markers.forEach(marker => {
      expect(marker).toHaveAttribute('data-fill-color', '#3388ff');
    });
  });
  
  it('renders markers in red color when they match the filter criteria', () => {
    const features = [
      createMockFeature('Lake 1', [18.0579, 59.3293], ['Gädda', 'Abborre']),
      createMockFeature('Lake 2', [17.0579, 58.3293], ['Gös']),
      createMockFeature('Lake 3', [16.0579, 57.3293], ['Abborre'])
    ];
    const data = createMockData(features);

    // We're setting Gädda and Abborre as filters, so Lake 1 and Lake 3 should be shown
    // and they should be colored red
    render(<Map data={data} filteredSpecies={new Set(['Gädda', 'Abborre'])} />);

    const markers = screen.getAllByTestId('circle-marker');
    expect(markers).toHaveLength(2); // Only lakes with Gädda or Abborre should be visible
    
    // These markers should have the red color (#ff3333)
    expect(markers[0]).toHaveAttribute('data-fill-color', '#ff3333'); // Lake 1 (has Gädda, Abborre)
    expect(markers[1]).toHaveAttribute('data-fill-color', '#ff3333'); // Lake 3 (has Abborre)
  });
  
  it('renders markers with mixed colors when some match filter criteria and others dont', () => {
    const features = [
      createMockFeature('Lake 1', [18.0579, 59.3293], ['Gädda', 'Abborre', 'Gös']),
      createMockFeature('Lake 2', [17.0579, 58.3293], ['Gös']),
      createMockFeature('Lake 3', [16.0579, 57.3293], ['Abborre', 'Gös'])
    ];
    const data = createMockData(features);

    // Only filter on Gös, so all lakes should be visible
    render(<Map data={data} filteredSpecies={new Set(['Gös'])} />);

    const markers = screen.getAllByTestId('circle-marker');
    expect(markers).toHaveLength(3); // All lakes have Gös and should be visible
    
    // All markers should have the red color (#ff3333) since they all match the filter
    markers.forEach(marker => {
      expect(marker).toHaveAttribute('data-fill-color', '#ff3333');
    });
  });

  it('handles missing or null values in tooltip', () => {
    const feature: GeoJsonFeature = {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [18.0579, 59.3293]
      },
      properties: {
        name: 'Test Lake',
        county: 'Test County',
        location: 'Test Location',
        maxDepth: null,
        area: 0,
        elevation: 50
      }
    };
    const data = createMockData([feature]);

    render(<Map data={data} filteredSpecies={new Set()} />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveTextContent('Maxdjup: Okänt');
    expect(tooltip).toHaveTextContent('Area: 0 ha');
    expect(tooltip).toHaveTextContent('Fångade arter: Inga rapporterade');
  });
});
