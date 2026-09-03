import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

import { getProductImage } from '../lib/getProductImage';

import type { Coupon, CouponStatus } from '../types';

type CouponProductJoin = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
};

type MyCouponRow = {
  id: string;
  barcode: string;
  status: 'unused' | 'used';
  expired_at: string | null;
  products: CouponProductJoin | CouponProductJoin[] | null;
};

// DB status와 만료일을 도메인 CouponStatus로 변환한다.
// unused라도 expired_at이 지났으면 expired로 본다.
function toCouponStatus(
  dbStatus: 'unused' | 'used',
  expiredAt: string | null,
): CouponStatus {
  if (dbStatus === 'used') return 'used';
  if (expiredAt && dayjs(expiredAt).endOf('day').isBefore(dayjs())) {
    return 'expired';
  }
  return 'available';
}

function toCoupon(row: MyCouponRow): Coupon {
  // products 조인은 배열로 반환될 수 있어 첫 번째 항목을 사용
  const product = Array.isArray(row.products)
    ? (row.products[0] ?? null)
    : row.products;

  return {
    id: row.id,
    name: product?.name ?? '',
    brand: product?.description ?? '',
    imageUrl: getProductImage(product?.image ?? null),
    barcode: row.barcode,
    expiresAt: row.expired_at ? dayjs(row.expired_at).format('YYYY.MM.DD') : '',
    status: toCouponStatus(row.status, row.expired_at),
  };
}

// 로그인한 사용자의 쿠폰함 목록을 조회한다.
// RLS 정책(coupons_owner)으로 인증된 사용자의 쿠폰만 반환된다.
export async function getMyCoupons(userId: string): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select(
      'id, barcode, status, expired_at, products(id, name, description, image)',
    )
    .eq('user_id', userId)
    .order('expired_at', { ascending: true });

  if (error) {
    throw new Error(`쿠폰함 조회 실패: ${error.message}`);
  }

  return (data ?? []).map((row) => toCoupon(row as MyCouponRow));
}
