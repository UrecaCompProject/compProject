import { useQuery } from '@tanstack/react-query';

import { useAuth, useIsLoggedIn } from '@/entities/user';

import { getExpiringCoupons } from '../api/getExpiringCoupons';

// 만료 임박 쿠폰 조회 — 로그인한 사용자의 unused 쿠폰 중 expired_at이 days일 이내인 것.
// staleTime 5분으로 설정해 페이지 이동마다 재요청 방지 (쿠폰 만료는 시간 단위로 변하므로 5분 캐싱이면 충분).
export function useExpiringCoupons(days = 3) {
  const { user } = useAuth();
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['coupons', 'expiring', user?.id, days],
    queryFn: () => getExpiringCoupons(user!.id, days),
    enabled: isLoggedIn && !!user,
    staleTime: 5 * 60 * 1000,
  });
}
