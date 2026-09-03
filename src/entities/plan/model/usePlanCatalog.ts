import { useQuery } from '@tanstack/react-query';

import { getPlanCatalog } from '../api/getPlanCatalog';

// 요금제 카탈로그 조회 — 공개 데이터, 캐싱 5분 (QueryClient 기본값)
export function usePlanCatalog() {
  return useQuery({
    queryKey: ['plans', 'catalog'],
    queryFn: getPlanCatalog,
  });
}
