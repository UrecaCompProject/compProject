import InfoRow from './InfoRow';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/InfoRow',
  component: InfoRow,
  args: {
    label: '개통일',
    value: '2023-09-11',
  },
} satisfies Meta<typeof InfoRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Highlight: Story = {
  args: {
    label: '요금제',
    value: '유쓰 5G 슬림+',
    highlight: true,
  },
};
