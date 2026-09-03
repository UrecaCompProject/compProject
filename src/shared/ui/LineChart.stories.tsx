import LineChart from './LineChart';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/LineChart',
  component: LineChart,
  args: {
    labels: [
      '9월',
      '10월',
      '11월',
      '12월',
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
    ],
    values: [
      12.4, 15.1, 9.8, 13.6, 11.2, 14.7, 10.5, 16.3, 12.9, 15.8, 13.1, 9.04,
    ],
    valueLabel: '데이터 사용량',
    unit: 'GB',
  },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwelveMonths: Story = {};

export const SixMonths: Story = {
  args: {
    labels: ['3월', '4월', '5월', '6월', '7월', '8월'],
    values: [10.5, 16.3, 12.9, 15.8, 13.1, 9.04],
    yTickCount: 8,
  },
};

export const ThreeMonths: Story = {
  args: {
    labels: ['6월', '7월', '8월'],
    values: [15.8, 13.1, 9.04],
    yTickCount: 5,
  },
};
