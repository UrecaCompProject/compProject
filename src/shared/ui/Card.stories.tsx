import Card from './Card';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/Card',
  component: Card,
  args: {
    children: 'Card content',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Bordered: Story = {
  args: { border: 'default' },
};

export const BrandBordered: Story = {
  args: { border: 'primary' },
};

export const WithShadow: Story = {
  args: { shadow: true },
};
