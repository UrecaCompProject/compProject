import { DEFAULT_PLAN_FILTER } from '../types';

import PlanFilterModal from './PlanFilterModal';

import type { PlanDetailItem } from '../types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const plans: PlanDetailItem[] = [
  {
    id: '1',
    category: '5G 요금제',
    dataTier: '대용량',
    targetAge: '일반',
    name: '5G 프리미어 에센셜',
    notes: '',
    monthlyFee: 85000,
    data: '30GB',
    dataSpeedAfter: '1Mbps',
    voice: '통화 무제한',
    message: '문자 무제한',
    shareData: '월 제공량 내 차감',
    tethering: '월 제공량 초과 시 차단',
    benefits: ['데이터 쉐어링 20GB'],
    ottBenefits: ['넷플릭스 스탠다드'],
    addOns: [],
    callAmountMin: null,
    smsAmount: null,
    contractPeriodMonths: null,
    couponText: null,
  },
  {
    id: '2',
    category: '5G 요금제',
    dataTier: '소용량',
    targetAge: '청년',
    name: '유쓰 5G 슬림+',
    notes: '',
    monthlyFee: 49000,
    data: '17GB',
    dataSpeedAfter: '400Kbps',
    voice: '통화 무제한',
    message: '문자 무제한',
    shareData: '월 제공량 내 차감',
    tethering: '월 제공량 초과 시 차단',
    benefits: [],
    ottBenefits: [],
    addOns: [],
    callAmountMin: null,
    smsAmount: null,
    contractPeriodMonths: null,
    couponText: null,
  },
  {
    id: '3',
    category: '5G 요금제',
    dataTier: '대용량',
    targetAge: '시니어',
    name: '실버 안심 요금제',
    notes: '',
    monthlyFee: 39000,
    data: '10GB',
    dataSpeedAfter: '400Kbps',
    voice: '통화 무제한',
    message: '문자 무제한',
    shareData: '월 제공량 내 차감',
    tethering: '월 제공량 초과 시 차단',
    benefits: [],
    ottBenefits: [],
    addOns: [],
    callAmountMin: null,
    smsAmount: null,
    contractPeriodMonths: null,
    couponText: null,
  },
];

const meta = {
  title: 'plan-detail/PlanFilterModal',
  component: PlanFilterModal,
  args: {
    plans,
    initialFilters: DEFAULT_PLAN_FILTER,
    onApply: (filters) => console.log('필터 적용', filters),
  },
} satisfies Meta<typeof PlanFilterModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoMatches: Story = {
  args: {
    plans: [],
  },
};
