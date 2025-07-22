import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PressureChartProps {
  data: {
    historical: { time: string; pressure: number }[];
    forecast: { time: string; pressure: number }[];
  } | null;
  loading: boolean;
  error: string | null;
}

export const PressureChart: React.FC<PressureChartProps> = ({ data, loading, error }) => {
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
        Lufttrycksanalys
      </Typography>
      <Box sx={{ height: 300 }}>
        <Line data={chartData} options={options} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Historisk: Open-Meteo • Prognos: api.met.no • Blå: Historisk • Röd: Prognos
      </Typography>
    </Box>
  );
};