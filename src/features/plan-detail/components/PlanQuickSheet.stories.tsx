import { useState } from 'react';

import { Button } from '@/features/shared';

import PlanQuickSheet from './PlanQuickSheet';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'plan-detail/PlanQuickSheet',
  component: PlanQuickSheet,
  args: {
    open: false,
    onOpenChange: () => {},
  },
} satisfies Meta<typeof PlanQuickSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>요금제 시트 열기</Button>
        <PlanQuickSheet open={open} onOpenChange={setOpen} />
      </>
    );
  },
};
