import { create } from 'zustand';

import type { RecommendedPlan } from '@/shared/lib/aiConsult';

interface SubscriptionState {
  // 요금제 가입/변경이 성공적으로 끝날 때마다 갱신 — 채팅(useChatSubscription)이 이
  // 값을 지켜보다가 안내 말풍선을 추가한다. 진입 경로(채팅 인라인 카드/상담 리포트/
  // 요금제 카탈로그 시트)와 무관하게 useSubmitSubscription 성공 시 항상 갱신되므로,
  // 어느 화면에서 가입/변경했든 동일하게 동작한다. currentPlan 자체는 TanStack
  // Query 캐시가 유일한 신뢰원이라 여기서 다시 들고 있지 않는다.
  lastChangedPlan: RecommendedPlan | null;
  // lastChangedPlan은 같은 요금제를 연달아 선택하면 참조/내용이 같아 변경 감지가
  // 안 될 수 있어, 매번 달라지는 타임스탬프로 "새 변경 이벤트"임을 구분한다.
  lastChangedAt: number | null;
  setLastChangedPlan: (plan: RecommendedPlan) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  lastChangedPlan: null,
  lastChangedAt: null,
  setLastChangedPlan: (plan) => {
    set({ lastChangedPlan: plan, lastChangedAt: Date.now() });
  },
}));
