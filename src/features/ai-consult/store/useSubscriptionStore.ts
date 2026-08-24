import { create } from 'zustand';

import type { RecommendedPlan } from '@/lib/aiConsult';

interface SubscriptionLog {
  plan: RecommendedPlan;
  subscribedAt: string;
}

interface SubscriptionState {
  currentPlan: RecommendedPlan | null;
  planHistory: SubscriptionLog[];
  subscribe: (plan: RecommendedPlan) => void;
  changePlan: (plan: RecommendedPlan) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  currentPlan: null,
  planHistory: [],
  subscribe: (plan) =>
    set((state) => ({
      currentPlan: plan,
      planHistory: [
        ...state.planHistory,
        { plan, subscribedAt: new Date().toISOString() },
      ],
    })),
  changePlan: (plan) =>
    set((state) => ({
      currentPlan: plan,
      planHistory: [
        ...state.planHistory,
        { plan, subscribedAt: new Date().toISOString() },
      ],
    })),
}));
