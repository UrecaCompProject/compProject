import { Database } from 'lucide-react';

import IconListItem from './IconListItem';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/IconListItem',
  component: IconListItem,
  args: {
    icon: Database,
    label: '5G 데이터 27GB + 3G 무제한',
  },
} satisfies Meta<typeof IconListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Badge: Story = {
  args: { variant: 'badge' },
};

export const BadgePurple: Story = {
  args: { variant: 'badge', badgeColor: 'accent-purple' },
};

export const Bordered: Story = {
  args: { variant: 'bordered' },
};
