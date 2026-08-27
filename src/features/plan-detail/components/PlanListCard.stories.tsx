import PlanListCard from './PlanListCard';

import type { PlanDetailItem } from '../types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const basePlan: PlanDetailItem = {
  id: '1',
  category: '5G 요금제',
  dataTier: '대용량',
  targetAge: '일반',
  name: '5G 프리미어 에센셜',
  notes: '5G 데이터 30GB + 소진 후 1Mbps 무제한',
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
  callAmountMin: null,
  smsAmount: null,
  contractPeriodMonths: null,
  couponText: '보유 쿠폰 적용 예정: 데이터 100MB 쿠폰',
};

const meta = {
  title: 'plan-detail/PlanListCard',
  component: PlanListCard,
  args: {
    plan: basePlan,
    onClick: () => {},
  },
} satisfies Meta<typeof PlanListCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithNotes: Story = {
  args: {
    plan: {
      ...basePlan,
      id: '2',
      name: '유쓰 5G 슬림+',
      targetAge: '청년',
      notes: '만 19~34세 청년 대상, 데이터 17GB + 소진 후 400Kbps 제공',
      monthlyFee: 49000,
    },
  },
};

export const ManyBenefits: Story = {
  args: {
    plan: {
      ...basePlan,
      id: '3',
      name: '요금 걱정없는 5G 27GB',
      monthlyFee: 78000,
      benefits: ['5G 데이터 27GB + 3G 무제한', '데이터 쉐어링 20GB'],
      ottBenefits: ['넷플릭스 스탠다드', '디즈니+ 스탠다드'],
      addOns: ['U+ VIP 등급', '구글 AI 구독형', '스마트기기 결합 할인'],
    },
  },
};
