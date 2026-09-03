import Line from './Line';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/Line',
  component: Line,
} satisfies Meta<typeof Line>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
