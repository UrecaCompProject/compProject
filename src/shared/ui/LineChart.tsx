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
  yTickCount?: number;
}

export default function LineChart({
  labels,
  values,
  valueLabel = '사용량',
  averageLabel = '평균',
  unit = '',
  height = 220,
  className = '',
  yTickCount = 5,
}: LineChartProps) {
  const average =
    values.length === 0
      ? 0
      : values.reduce((sum, value) => sum + value, 0) / values.length;

  // yTickCount가 1 이하면 (yTickCount - 1)이 0이 되어 0으로 나누기가
  // 발생하므로, 최소 2로 정규화한다.
  const tickCount = Number.isFinite(yTickCount)
    ? Math.max(2, Math.floor(yTickCount))
    : 5;

  // 0부터 최댓값까지 정수 눈금이 tickCount개 찍히도록, 최댓값을
  // (tickCount - 1)의 배수로 올림한다.
  const dataMax = values.length === 0 ? 0 : Math.max(...values);
  const step = Math.ceil(dataMax / (tickCount - 1)) || 1;
  const yMax = step * (tickCount - 1);

  const data = {
    labels,
    datasets: [
      {
        label: valueLabel,
        data: values,
        borderColor: '#3d74f0',
        backgroundColor: '#3d74f020',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
        pointBackgroundColor: '#3d74f0',
      },
      {
        label: averageLabel,
        data: labels.map(() => average),
        borderColor: '#c2ceea',
        borderDash: [6, 3],
        pointRadius: 0,
        borderWidth: 1.5,
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
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) =>
            `${context.dataset.label}: ${context.formattedValue}${unit}`,
        },
      },
    },
    scales: {
      y: {
        display: true,
        min: 0,
        max: yMax,
        grid: { color: '#dbe6f3' },
        ticks: { stepSize: step, color: '#c2ceea', font: { size: 12 } },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#a8afb9',
          font: { size: values.length === 12 ? 13 : 13, weight: 500 },
          callback(value) {
            const label = this.getLabelForValue(Number(value));
            const isTwelveMonths = values.length === 12;
            return isTwelveMonths && this.chart.width < 400
              ? label.replace('월', '')
              : label;
          },
        },
      },
    },
  };

  return (
    <div className={className} style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
}
