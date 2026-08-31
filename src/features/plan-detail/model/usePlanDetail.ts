import { useMemo, useState } from 'react';

import { toRecommendedPlan } from '../lib/toRecommendedPlan';

import { usePlans } from './usePlans';

// id로 요금제 상세를 조회하고, 가입 시트 오픈 상태까지 함께 관리한다.
export function usePlanDetail(id: string | undefined) {
  const { data: plans = [], isLoading, error } = usePlans();
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  const plan = plans.find((item) => item.id === id) ?? null;

  // 신청 시트 초기화 이펙트가 매 렌더 재실행되지 않도록 참조를 안정화한다.
  const recommendedPlan = useMemo(
    () => (plan ? toRecommendedPlan(plan) : null),
    [plan],
  );

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
    recommendedPlan,
    isSubscribeOpen,
    setIsSubscribeOpen,
  };
}
