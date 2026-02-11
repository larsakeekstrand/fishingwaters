import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { FishingForecast } from '../FishingForecast';

vi.mock('react-chartjs-2', () => ({
  Line: () => null,
}));

describe('FishingForecast', () => {
  const mockData = {
    historical: [
      { time: '2025-07-17T12:00:00Z', pressure: 1013.2, windSpeed: 3, temperature: 15 },
      { time: '2025-07-18T12:00:00Z', pressure: 1014.1, windSpeed: 2, temperature: 16 },
      { time: '2025-07-19T12:00:00Z', pressure: 1015.0, windSpeed: 4, temperature: 14 },
      { time: '2025-07-20T12:00:00Z', pressure: 1014.5, windSpeed: 3, temperature: 17 },
      { time: '2025-07-21T12:00:00Z', pressure: 1013.8, windSpeed: 2, temperature: 18 },
    ],
    forecast: [
      { time: '2025-07-22T12:00:00Z', pressure: 1013.5, windSpeed: 5, temperature: 16 },
      { time: '2025-07-23T12:00:00Z', pressure: 1014.2, windSpeed: 3, temperature: 15 },
      { time: '2025-07-24T12:00:00Z', pressure: 1015.1, windSpeed: 2, temperature: 14 },
      { time: '2025-07-25T12:00:00Z', pressure: 1015.5, windSpeed: 1, temperature: 13 },
      { time: '2025-07-26T12:00:00Z', pressure: 1014.8, windSpeed: 4, temperature: 16 },
    ],
  };

  it('should render loading state', () => {
    render(<FishingForecast data={null} loading={true} error={null} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const errorMessage = 'Failed to load weather data';
    render(<FishingForecast data={null} loading={false} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render forecast title and source caption when data is provided', () => {
    render(<FishingForecast data={mockData} loading={false} error={null} />);
    expect(screen.getByText('Fiskeprognos')).toBeInTheDocument();
    expect(screen.getByText(/Historisk: Open-Meteo/)).toBeInTheDocument();
  });

  it('should render star ratings for each day', () => {
    render(<FishingForecast data={mockData} loading={false} error={null} />);
    const ratings = screen.getAllByRole('img');
    expect(ratings.length).toBe(10); // 10 days of ratings
  });

  it('should return null when no data and not loading', () => {
    const { container } = render(<FishingForecast data={null} loading={false} error={null} />);
    expect(container.firstChild).toBeNull();
  });
});
