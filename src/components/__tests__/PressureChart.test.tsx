import React from 'react';
import { render, screen } from '@testing-library/react';
import { PressureChart } from '../PressureChart';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => null,
}));

describe('PressureChart', () => {
  const mockData = {
    historical: [
      { time: '2025-07-17T12:00:00Z', pressure: 1013.2 },
      { time: '2025-07-18T12:00:00Z', pressure: 1014.1 },
      { time: '2025-07-19T12:00:00Z', pressure: 1015.0 },
      { time: '2025-07-20T12:00:00Z', pressure: 1014.5 },
      { time: '2025-07-21T12:00:00Z', pressure: 1013.8 },
    ],
    forecast: [
      { time: '2025-07-22T12:00:00Z', pressure: 1013.5 },
      { time: '2025-07-23T12:00:00Z', pressure: 1014.2 },
      { time: '2025-07-24T12:00:00Z', pressure: 1015.1 },
      { time: '2025-07-25T12:00:00Z', pressure: 1015.5 },
      { time: '2025-07-26T12:00:00Z', pressure: 1014.8 },
    ],
  };

  it('should render loading state', () => {
    render(<PressureChart data={null} loading={true} error={null} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const errorMessage = 'Failed to load weather data';
    render(<PressureChart data={null} loading={false} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render chart when data is provided', () => {
    render(<PressureChart data={mockData} loading={false} error={null} />);
    expect(screen.getByText('Lufttrycksanalys')).toBeInTheDocument();
    expect(screen.getByText(/Data från api.met.no/)).toBeInTheDocument();
  });

  it('should return null when no data and not loading', () => {
    const { container } = render(<PressureChart data={null} loading={false} error={null} />);
    expect(container.firstChild).toBeNull();
  });
});