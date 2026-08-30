import { useState } from 'react';

import { toRecommendedPlan } from '../lib/toRecommendedPlan';

import { usePlans } from './usePlans';

// id로 요금제 상세를 조회하고, 가입 시트 오픈 상태까지 함께 관리한다.
export function usePlanDetail(id: string | undefined) {
  const { data: plans = [], isLoading, error } = usePlans();
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  const plan = plans.find((item) => item.id === id) ?? null;

  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? '요금제 정보를 불러오지 못했습니다.'
        : null;

  return {
    plan,
    isLoading,
    errorMessage,
    recommendedPlan: plan ? toRecommendedPlan(plan) : null,
    isSubscribeOpen,
    setIsSubscribeOpen,
  };
}
