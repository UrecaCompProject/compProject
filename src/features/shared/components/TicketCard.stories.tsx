import TicketCard from './TicketCard';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/TicketCard',
  component: TicketCard,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="flex justify-center p-6 bg-surface-page">
        <Story />
      </div>
    ),
  ],
  args: {
    radius: 6,
    gap: 24,
  },
  argTypes: {
    radius: {
      control: { type: 'range', min: 2, max: 16, step: 1 },
      description: '펀칭 원의 반지름(px)',
    },
    gap: {
      control: { type: 'range', min: 6, max: 40, step: 1 },
      description: '펀칭 사이 간격(px). 카드 폭과 무관하게 반복 타일링됨.',
    },
    startOffset: {
      control: { type: 'range', min: 0, max: 40, step: 1 },
      description:
        '첫/마지막 펀칭이 좌우 끝에서 떨어진 거리(px). 안 넘기면 gap과 같은 값이 기본으로 적용됨.',
    },
    fill: {
      control: 'color',
      description: '카드 배경색. 기본값은 --color-surface-card',
    },
  },
} satisfies Meta<typeof TicketCard>;

export default meta;
type Story = StoryObj<typeof meta>;

function SampleContent() {
  return (
    <div className="flex w-[358px] flex-col gap-2">
      <p className="text-[14px] font-semibold text-fg-primary">
        요금 걱정없는 5G 27GB
      </p>
      <p className="text-[13px] text-fg-tertiary">
        5G 데이터 27GB + 3G 무제한 · 통화·문자 무제한
      </p>
      <div className="border-b border-dashed border-fg-disabled" />
      <p className="text-[13px] text-fg-tertiary">
        예산을 아끼면서도 넉넉한 데이터를 쓰고 싶으시다면 추천드려요.
      </p>
    </div>
  );
}

export const Default: Story = {
  args: {
    children: <SampleContent />,
  },
};

export const CustomFill: Story = {
  args: {
    fill: '#eef2ff',
    children: <SampleContent />,
  },
};

export const PlanCompareUsage: Story = {
  args: {
    children: (
      <div className="flex w-[358px] flex-col gap-3">
        <div className="grid grid-cols-2 gap-4 pb-3">
          <p className="text-left text-[14px] font-semibold text-fg-primary">
            이용중인 요금제
          </p>
          <p className="text-left text-[14px] font-semibold text-reward-active">
            선택한 요금제
          </p>
        </div>
        <div className="border-b border-fg-primary" />
        <div className="grid grid-cols-2 gap-4 py-3">
          <div className="flex flex-col gap-1">
            <p className="text-[12px] font-medium text-compare-neutral">
              월정액
            </p>
            <p className="text-[14px] font-semibold text-fg-tertiary">
              78,000원
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[12px] font-medium text-reward-active">월정액</p>
            <p className="text-[14px] font-bold text-reward-active">61,000원</p>
          </div>
        </div>
      </div>
    ),
  },
};
