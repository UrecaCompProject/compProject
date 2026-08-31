import type { RewardProduct } from '@/entities/reward';
import { supabase } from '@/shared/lib/supabaseClient';

import { getProductImage } from '../lib/getProductImage';

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  required_badges: number;
  image: string | null;
  is_active: boolean;
};

function toRewardProduct(row: ProductRow): RewardProduct {
  return {
    id: row.id,
    brand: row.description ?? '',
    name: row.name,
    imageUrl: getProductImage(row.image),
    badgeCost: row.required_badges,
  };
}

// 배지 상점 상품 목록 조회. products 테이블은 RLS상 로그인 사용자만 조회 가능하다.
export async function getProducts(): Promise<RewardProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('description', { ascending: true })
    .order('required_badges', { ascending: true });

  if (error) {
    throw new Error(`상품 목록 조회 실패: ${error.message}`);
  }

  return (data ?? []).map((row) => toRewardProduct(row as ProductRow));
}
