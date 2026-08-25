export type CouponStatus = 'available' | 'used' | 'expired';

export type Coupon = {
  id: string;
  name: string;
  brand: string;
  image: string;
  expiresAt: string;
  status: CouponStatus;
};
