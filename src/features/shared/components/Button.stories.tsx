import Button from './Button';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/Button',
  component: Button,
  args: {
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Chip: Story = {
  args: { variant: 'chip' },
};
export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
};
