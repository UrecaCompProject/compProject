import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import type { ChartOptions, TooltipItem } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

interface LineChartProps {
  labels: string[];
  values: number[];
  valueLabel?: string;
  averageLabel?: string;
  unit?: string;
  height?: number;
  className?: string;
}

export default function LineChart({
  labels,
  values,
  valueLabel = '사용량',
  averageLabel = '평균',
  unit = '',
  height = 220,
  className = '',
}: LineChartProps) {
  const average =
    values.length === 0
      ? 0
      : values.reduce((sum, value) => sum + value, 0) / values.length;

  const data = {
    labels,
    datasets: [
      {
        label: valueLabel,
        data: values,
        borderColor: '#4c8fe1',
        backgroundColor: 'rgba(76, 143, 225, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#4c8fe1',
      },
      {
        label: averageLabel,
        data: labels.map(() => average),
        borderColor: '#d6567f',
        borderDash: [6, 4],
        pointRadius: 0,
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) =>
            `${context.dataset.label}: ${context.formattedValue}${unit}`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#dbe6f3' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className={className} style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
}
