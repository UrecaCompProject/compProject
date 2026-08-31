import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

import type { CouponRow } from '../model/reward';

// 오늘부터 days일 이내에 만료되는 미사용 쿠폰을 조회한다.
// RLS 정책(coupons_owner)으로 인해 인증된 사용자의 쿠폰만 반환된다.
export async function getExpiringCoupons(
  userId: string,
  days = 3,
): Promise<CouponRow[]> {
  const today = dayjs().startOf('day');
  const threshold = today.add(days, 'day').endOf('day');

  const { data, error } = await supabase
    .from('coupons')
    .select(
      'id, exchange_id, user_id, product_id, barcode, status, used_at, expired_at, created_at, updated_at, products(id, name, description)',
    )
    .eq('user_id', userId)
    .eq('status', 'unused')
    .not('expired_at', 'is', null)
    .gte('expired_at', today.format('YYYY-MM-DD'))
    .lte('expired_at', threshold.format('YYYY-MM-DD'))
    .order('expired_at', { ascending: true });

  if (error) {
    throw new Error(`만료 임박 쿠폰 조회 실패: ${error.message}`);
  }

  return (data ?? []).map((row) => toCouponRow(row as Record<string, unknown>));
}

// Supabase 조인 쿼리 결과를 CouponRow 타입으로 변환
// products 조인은 배열로 반환될 수 있어 첫 번째 항목을 사용
function toCouponRow(row: Record<string, unknown>): CouponRow {
  const products = row.products as
    | { id: string; name: string; description: string | null }
    | { id: string; name: string; description: string | null }[]
    | null;

  const product = Array.isArray(products) ? (products[0] ?? null) : products;

  return {
    id: row.id as string,
    exchangeId: row.exchange_id as string | null,
    userId: row.user_id as string,
    productId: row.product_id as string,
    barcode: row.barcode as string,
    status: row.status as 'unused' | 'used',
    usedAt: row.used_at as string | null,
    expiredAt: row.expired_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    product,
  };
}
