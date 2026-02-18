import React, { useMemo, useState } from 'react';
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
import {
  Box, Typography, CircularProgress, Alert, Rating, Tooltip,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
  const [infoOpen, setInfoOpen] = useState(false);

  const allScores = useMemo(() => {
    if (!data) return [];
    return calculateFishingScores(data.historical, data.forecast);
  }, [data]);

  const forecastScores = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allScores.filter(s => s.date >= today);
  }, [allScores]);

  const bestDayIndex = useMemo(() => {
    if (forecastScores.length === 0) return -1;
    return forecastScores.reduce((best, s, i) => s.rawScore > forecastScores[best].rawScore ? i : best, 0);
  }, [forecastScores]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography variant="h6">
          Fiskeprognos
        </Typography>
        <IconButton size="small" onClick={() => setInfoOpen(true)} aria-label="Visa beräkningsinfo">
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Så beräknas fiskeprognosen</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            Varje dag får 1-5 stjärnor baserat på fyra faktorer:
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Trycktrend (40%)</strong>
            <br />
            Stabilt eller långsamt stigande tryck ger bäst poäng. Snabba tryckfall sänker betyget.
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
            <strong>Vindhastighet (25%)</strong>
            <br />
            Lätt vind (1-4 m/s) är idealiskt. Över 10 m/s ger lågt betyg.
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
            <strong>Månfas (20%)</strong>
            <br />
            Nymåne och fullmåne anses ge bäst fiske. Kvartmåne ger lägst poäng.
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
            <strong>Temperatur (15%)</strong>
            <br />
            10-20°C är idealiskt för svenskt sötvattensfiske. Extrema temperaturer sänker betyget.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
            Tryck för på en dag för att se detaljerad poäng per faktor.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoOpen(false)}>Stäng</Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mb: 2,
          gap: 0.5,
        }}
      >
        {forecastScores.map((score, index) => (
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
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                ...(index === bestDayIndex && {
                  bgcolor: 'rgba(255, 193, 7, 0.15)',
                }),
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: index === bestDayIndex ? 700 : 400 }}>
                {formatDayName(score.date + 'T12:00:00Z')} {formatDate(score.date + 'T12:00:00Z')}
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
