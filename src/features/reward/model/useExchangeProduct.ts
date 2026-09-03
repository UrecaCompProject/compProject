import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/entities/user';

import { postExchange } from '../api/postExchange';

// 배지 상점 상품 교환. 성공하면 쿠폰함/배지 잔액 쿼리를 무효화해 즉시 반영한다.
export function useExchangeProduct() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      badgeCost,
    }: {
      productId: string;
      badgeCost: number;
    }) => postExchange(user!.id, productId, badgeCost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['badge', 'balance'] });
    },
  });
}
