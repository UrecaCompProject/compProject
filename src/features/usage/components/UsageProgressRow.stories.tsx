import UsageProgressRow from './UsageProgressRow';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'usage/UsageProgressRow',
  component: UsageProgressRow,
  args: {
    label: '5G 데이터',
    value: '9.04GB',
    total: '17.00GB',
    percent: 53.18,
  },
} satisfies Meta<typeof UsageProgressRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Unlimited: Story = {
  args: {
    label: '400kB 속도 데이터',
    value: '무제한',
    total: undefined,
    percent: 100,
  },
};

export const Empty: Story = {
  args: {
    label: '메세지',
    value: '0건',
    total: '100건',
    percent: 0,
  },
};
