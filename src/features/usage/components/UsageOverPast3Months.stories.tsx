import UsageOverPast3Months from './UsageOverPast3Months';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'usage/UsageOverPast3Months',
  component: UsageOverPast3Months,
} satisfies Meta<typeof UsageOverPast3Months>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
