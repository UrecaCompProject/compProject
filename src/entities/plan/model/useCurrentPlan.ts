import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/entities/user';

import { getCurrentPlan } from '../api/getCurrentPlan';

// 현재 요금제 조회 — 로그인한 사용자의 current_plans 테이블
// enabled: false로 로그인 전에는 호출하지 않음
export function useCurrentPlan(isLoggedIn: boolean) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['plans', 'current', user?.id],
    queryFn: getCurrentPlan,
    enabled: isLoggedIn && !!user,
  });
}
