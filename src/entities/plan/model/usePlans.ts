import { useQuery } from '@tanstack/react-query';

import { getPlans } from '../api/getPlans';

// 요금제 상세 목록 조회 — 공개 데이터, 캐싱 5분 (QueryClient 기본값)
export function usePlans() {
  return useQuery({
    queryKey: ['plans', 'detail'],
    queryFn: getPlans,
  });
}
