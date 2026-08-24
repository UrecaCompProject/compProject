import { Database, Gift, Phone } from 'lucide-react';

import PlanCard from './PlanCard';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'plan-catalog/PlanCard',
  component: PlanCard,
  args: {
    title: '요금 걱정없는 5G 27GB',
    price: 78000,
    benefits: [
      { icon: Database, label: '5G 데이터 27GB + 3G 무제한' },
      { icon: Phone, label: '통화·문자 무제한' },
      { icon: Gift, label: '구글 AI 구독형' },
    ],
  },
} satisfies Meta<typeof PlanCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 상태: 쿠폰/사유 없음
export const Default: Story = {};

// 북마크
export const Saved: Story = {
  args: { saved: true },
};

// 추천 사유만
export const WithReason: Story = {
  args: {
    reason: '통화 위주로 사용하시고 데이터는 가끔 쓰신다면 합리적이에요.',
  },
};

// 쿠폰 안내만
export const WithCoupon: Story = {
  args: {
    couponText: '보유 쿠폰 적용 예정: 데이터 100MB 쿠폰',
  },
};

// 사유 + 쿠폰
export const Full: Story = {
  args: {
    reason: '통화 위주로 사용하시고 데이터는 가끔 쓰신다면 합리적이에요.',
    couponText: '보유 쿠폰 적용 예정: 데이터 100MB 쿠폰',
  },
};

// 혜택 항목이 많은 경우
export const ManyBenefits: Story = {
  args: {
    benefits: [
      { icon: Database, label: '5G 데이터 27GB + 3G 무제한' },
      { icon: Phone, label: '통화·문자 무제한' },
      { icon: Gift, label: '구글 AI 구독형' },
      { icon: Database, label: '데이터 쉐어링 20GB' },
      { icon: Phone, label: '해외 로밍 데이터 무제한' },
    ],
  },
};
