import { create } from 'zustand';

import { getCurrentPlan } from '@/entities/plan';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import { submitSubscription } from '../api/submitSubscription';

import type { SubscriptionForm } from '../types';

interface SubscriptionLog {
  plan: RecommendedPlan;
  subscribedAt: string;
}

interface SubscriptionState {
  currentPlan: RecommendedPlan | null;
  planHistory: SubscriptionLog[];
  loadCurrentPlan: () => Promise<void>;
  submitApplication: (
    plan: RecommendedPlan,
    form: SubscriptionForm,
  ) => Promise<string>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  currentPlan: null,
  planHistory: [],
  loadCurrentPlan: async () => {
    const plan = await getCurrentPlan();
    set({ currentPlan: plan });
  },
  submitApplication: async (plan, form) => {
    const currentPlanId =
      form.type === 'change' ? Number(get().currentPlan?.planId) : null;
    const applicationId = await submitSubscription({
      plan,
      form,
      currentPlanId: Number.isNaN(currentPlanId) ? null : currentPlanId,
    });
    set((state) => ({
      currentPlan: plan,
      planHistory: [
        ...state.planHistory,
        { plan, subscribedAt: new Date().toISOString() },
      ],
    }));
    return applicationId;
  },
}));
