import { useQuery } from '@tanstack/react-query';

import { getProducts } from '../api/getProducts';

// 배지 상점 상품 목록 — 로그인 세션 필요(RLS)
export function useProducts() {
  return useQuery({
    queryKey: ['reward', 'products'],
    queryFn: getProducts,
  });
}
