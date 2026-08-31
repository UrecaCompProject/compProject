import { useQuery } from '@tanstack/react-query';

import { useAuth, useIsLoggedIn } from '@/entities/user';

import { getMyCoupons } from '../api/getMyCoupons';

// 쿠폰함 목록 조회 — 로그인한 사용자의 쿠폰 전체.
// staleTime 5분으로 페이지 이동마다 재요청을 막는다.
export function useMyCoupons() {
  const { user } = useAuth();
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['coupons', 'mine', user?.id],
    queryFn: () => getMyCoupons(user!.id),
    enabled: isLoggedIn && !!user,
    staleTime: 5 * 60 * 1000,
  });
}
