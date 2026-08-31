export type MissionIcon =
  'card' | 'timer' | 'roulette' | 'scratch' | 'security' | 'telecom' | 'share';

export type Mission = {
  id: string;
  uuid: string;
  title: string;
  reward: number;
  actionLabel: '시작' | '공유';
  icon: MissionIcon;
};

export type RewardProduct = {
  id: string;
  brand: string;
  name: string;
  imageUrl: string;
  badgeCost: number;
};

export type CouponStatus = 'available' | 'used' | 'expired';

export type Coupon = {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  expiresAt: string;
  status: CouponStatus;
};

// DB coupons 테이블 row + 조인된 product 정보 — Supabase 조회 결과 매핑
export type CouponRow = {
  id: string;
  exchangeId: string | null;
  userId: string;
  productId: string;
  barcode: string;
  status: 'unused' | 'used';
  usedAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  // products 테이블 조인 결과
  product: {
    id: string;
    name: string;
    description: string | null;
  } | null;
};
