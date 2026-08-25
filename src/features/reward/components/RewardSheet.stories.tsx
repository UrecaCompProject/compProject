import { useState } from 'react';

import { Button } from '@/features/shared';

import RewardSheet from './RewardSheet';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'reward/RewardSheet',
  component: RewardSheet,
  args: {
    open: true,
    onOpenChange: () => undefined,
  },
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'surface-page',
    },
  },
} satisfies Meta<typeof RewardSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <main className="min-h-screen bg-surface-page p-5">
        <Button onClick={() => setOpen(true)}>혜택/이벤트 열기</Button>

        <RewardSheet open={open} onOpenChange={setOpen} />
      </main>
    );
  },
};
