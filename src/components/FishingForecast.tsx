import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Typography, CircularProgress, Alert, Rating, Tooltip } from '@mui/material';
import { WeatherResult } from '../services/weatherService';
import { calculateFishingScores, DailyFishingScore } from '../utils/fishingScoreCalculator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface FishingForecastProps {
  data: WeatherResult | null;
  loading: boolean;
  error: string | null;
}

export const FishingForecast: React.FC<FishingForecastProps> = ({ data, loading, error }) => {
  const scores = useMemo(() => {
    if (!data) return [];
    return calculateFishingScores(data.historical, data.forecast);
  }, [data]);

  const bestDayIndex = useMemo(() => {
    if (scores.length === 0) return -1;
    return scores.reduce((best, s, i) => s.rawScore > scores[best].rawScore ? i : best, 0);
  }, [scores]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 1 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
  };

  const formatDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { weekday: 'short' });
  };

  const buildTooltip = (score: DailyFishingScore): string => {
    const lines = [
      `Trycktrend: ${Math.round(score.factors.pressureTrend * 100)}%`,
      `Vind: ${Math.round(score.factors.wind * 100)}%`,
      `Temperatur: ${Math.round(score.factors.temperature * 100)}%`,
      `Måne: ${score.factors.moonPhaseName} (${Math.round(score.factors.moonPhase * 100)}%)`,
    ];
    return lines.join('\n');
  };

  const allData = [...data.historical, ...data.forecast];
  const labels = allData.map(d => formatDate(d.time));
  const pressures = allData.map(d => d.pressure);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Lufttryck (hPa)',
        data: pressures,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        segment: {
          borderColor: (ctx: any) => {
            const index = ctx.p0DataIndex;
            return index < data.historical.length ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)';
          },
          borderDash: (ctx: any) => {
            const index = ctx.p0DataIndex;
            return index === data.historical.length - 1 ? [5, 5] : [];
          },
        },
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Lufttryck - Senaste 5 dagar & 5 dagars prognos',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const isHistorical = index < data.historical.length;
            const label = isHistorical ? 'Historisk' : 'Prognos';
            return `${label}: ${context.parsed.y} hPa`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Tryck (hPa)',
        },
      },
    },
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Fiskeprognos
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          mb: 2,
          overflowX: 'auto',
          gap: 0.5,
        }}
      >
        {scores.map((score, index) => (
          <Tooltip
            key={score.date}
            title={
              <span style={{ whiteSpace: 'pre-line' }}>
                {buildTooltip(score)}
              </span>
            }
            arrow
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                px: 0.5,
                py: 0.5,
                borderRadius: 1,
                minWidth: 48,
                ...(index === bestDayIndex && {
                  bgcolor: 'rgba(255, 193, 7, 0.15)',
                }),
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: index === bestDayIndex ? 700 : 400 }}>
                {formatDayName(score.date + 'T12:00:00Z')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {formatDate(score.date + 'T12:00:00Z')}
              </Typography>
              <Rating
                value={score.stars}
                readOnly
                size="small"
                max={5}
                sx={{ fontSize: '0.85rem' }}
              />
            </Box>
          </Tooltip>
        ))}
      </Box>

      <Box sx={{ height: 250 }}>
        <Line data={chartData} options={options} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Historisk: Open-Meteo | Prognos: api.met.no | Blå: Historisk | Röd: Prognos
      </Typography>
    </Box>
  );
};
