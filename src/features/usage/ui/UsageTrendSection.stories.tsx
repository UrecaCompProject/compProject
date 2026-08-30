import UsageTrendSection from './UsageTrendSection';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'usage/UsageTrendSection',
  component: UsageTrendSection,
} satisfies Meta<typeof UsageTrendSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [
      { month: '9월', usage: 12.4 },
      { month: '10월', usage: 15.1 },
      { month: '11월', usage: 9.8 },
      { month: '12월', usage: 13.6 },
      { month: '1월', usage: 11.2 },
      { month: '2월', usage: 14.7 },
      { month: '3월', usage: 10.5 },
      { month: '4월', usage: 16.3 },
      { month: '5월', usage: 12.9 },
      { month: '6월', usage: 15.8 },
      { month: '7월', usage: 13.1 },
      { month: '8월', usage: 9.04 },
    ],
  },
};
