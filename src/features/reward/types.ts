// reward 타입은 entities/reward로 이관됨
// 하위 호환을 위해 entities/reward에서 re-export
export type {
  MissionIcon,
  Mission,
  RewardProduct,
  CouponStatus,
  Coupon,
} from '@/entities/reward';
