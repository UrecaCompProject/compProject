import PlanCompare from './PlanCompare';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'plan-change/PlanCompare',
  component: PlanCompare,
  args: {
    data: {
      currentPlanName: '요금 걱정없는 5G 20GB',
      currentFee: '78,000원',
      currentDiscount: '월 63,750원',
      currentData: '20GB + 400Kbps 무제한',
      currentTethering: '월 제공량 20GB 초과시 차단',
      currentShareData: '월 제공량 내 차감',
      currentVoice: '기본 제공 (월 300분)',
      currentMessage: '기본 제공 (월 300건)',

      selectedPlanName: '데이터 플랜 31GB(유쓰혜택)',
      selectedFee: '61,000원',
      selectedDiscount: '월 78,750원',
      selectedData: '31GB + 1Mbps 무제한',
      selectedTethering: '월 제공량 46GB 초과시 차단',
      selectedShareData: '월 제공량 내 차감',
      selectedVoice: '기본 제공 (월 300분)',
      selectedMessage: '기본 제공 (월 300건)',
    },
  },
} satisfies Meta<typeof PlanCompare>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
