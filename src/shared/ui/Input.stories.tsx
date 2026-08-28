import Input from './Input';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/Input',
  component: Input,
  args: {
    placeholder: 'Enter text',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Error: Story = {
  args: { variant: 'error' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
