import PlanInfoSection from './PlanInfoSection';

import type { PlanDetailItem } from '../types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const basePlan: PlanDetailItem = {
  id: '1',
  category: '5G 요금제',
  dataTier: '대용량',
  targetAge: '일반',
  name: '5G 프리미어 에센셜',
  notes: '데이터 소진 후에도 최대 1Mbps 속도로 계속 이용할 수 있어요',
  monthlyFee: 85000,
  data: '30GB',
  dataSpeedAfter: '1Mbps',
  voice: '통화 무제한',
  message: '문자 무제한',
  shareData: '월 제공량 내 차감',
  tethering: '월 제공량 초과 시 차단',
  benefits: ['데이터 쉐어링 20GB', '해외 로밍 데이터 무제한'],
  ottBenefits: ['넷플릭스 스탠다드'],
  addOns: ['U+ VIP 등급'],
};

const meta = {
  title: 'plan-detail/PlanInfoSection',
  component: PlanInfoSection,
  args: {
    plan: basePlan,
  },
} satisfies Meta<typeof PlanInfoSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// callAmountMin/smsAmount가 있으면 "기본 제공 (월 n분/건)" 형식으로,
// 없으면 plan.voice/plan.message 문구로 대체되는지 확인
export const WithCallAndSmsAmount: Story = {
  args: {
    plan: {
      ...basePlan,
      callAmountMin: 300,
      smsAmount: 300,
    },
  },
};

export const NoBenefits: Story = {
  args: {
    plan: {
      ...basePlan,
      name: '데이터 다이렉트 46',
      benefits: [],
      ottBenefits: [],
      addOns: [],
    },
  },
};

export const ManyBenefits: Story = {
  args: {
    plan: {
      ...basePlan,
      name: '요금 걱정없는 5G 27GB',
      benefits: ['5G 데이터 27GB + 3G 무제한', '데이터 쉐어링 20GB'],
      ottBenefits: ['넷플릭스 스탠다드', '디즈니+ 스탠다드'],
      addOns: ['U+ VIP 등급', '구글 AI 구독형', '스마트기기 결합 할인'],
    },
  },
};
