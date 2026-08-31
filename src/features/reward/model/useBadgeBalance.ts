import { useQuery } from '@tanstack/react-query';

import { useAuth, useIsLoggedIn } from '@/entities/user';

import { getBadgeBalance } from '../api/getBadge';

// 로그인한 사용자가 보유한 총 배지 개수(모든 badge_id의 balance 합)를 조회하는 훅.
export function useBadgeBalance() {
  const { user } = useAuth();
  const isLoggedIn = useIsLoggedIn();

  const { data: badgeBalance = 0 } = useQuery({
    queryKey: ['badge', 'balance', user?.id],
    queryFn: () => getBadgeBalance(user!.id),
    enabled: isLoggedIn && !!user,
  });

  return badgeBalance;
}
