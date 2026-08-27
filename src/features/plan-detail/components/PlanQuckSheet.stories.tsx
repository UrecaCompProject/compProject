import { useState } from 'react';

import { Button } from '@/features/shared';

import PlanQuickSheet from './PlanQuickSheet';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'plan-detail/PlanQuickSheet',
  component: PlanQuickSheet,
} satisfies Meta<typeof PlanQuickSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// 챗인풋 연결 전, 이 시트 하나만 단독으로 열어서
// 목록 -> 카드 클릭 -> 상세(헤더 "< 요금제 조회"로 전환) -> 뒤로가기 흐름을 확인한다.
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
