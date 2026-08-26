import UsageTrendSection from './UsageTrendSection';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'usage/UsageTrendSection',
  component: UsageTrendSection,
} satisfies Meta<typeof UsageTrendSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
