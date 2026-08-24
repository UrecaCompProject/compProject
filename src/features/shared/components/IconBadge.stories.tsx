import { Database } from 'lucide-react';

import IconBadge from './IconBadge';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/IconBadge',
  component: IconBadge,
  args: {
    icon: Database,
  },
} satisfies Meta<typeof IconBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AccentPurple: Story = {
  args: { color: 'accent-purple' },
};

export const AccentPrimary: Story = {
  args: { color: 'accent-primary' },
};

export const Disabled: Story = {
  args: { color: 'disabled' },
};

export const RadiusFull: Story = {
  args: { radius: 'full' },
};

export const Large: Story = {
  args: { size: 40 },
};

export const CustomColor: Story = {
  args: { bgColor: 'bg-orange-100', iconColor: 'text-orange-600' },
};
