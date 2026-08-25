// ai-consult Edge Function의 공개 요청/응답 타입.
export type ChatMode =
  | 'menu'
  | 'recommend'
  | 'compare'
  | 'subscribe'
  | 'general'
  | 'game'
  | 'attendance'
  | 'report';

export interface ConsultRequest {
  currentPlan?: string;
  dataUsage?: number;
  voiceUsage?: number;
  smsUsage?: number;
  budget?: number;
  ageGroup?: string;
  ott?: string[];
  priority?: 'budget' | 'data' | 'max_data';
  userMessage?: string;
  mode?: ChatMode;
  isLoggedIn?: boolean;
  // 레포트 생성용 필드
  conversation?: string;
  recommendationResult?: string;
}

export interface ConsultResponse {
  recommendations: {
    planId: string;
    planName: string;
    reason: string;
    savingAmount: number;
  }[];
  notice?: string;
  quickReplies?: string[];
  mode?: ChatMode;
  form?: {
    title?: string;
    fields: {
      name: string;
      label: string;
      type: 'select' | 'number' | 'text' | 'multi-select';
      options?: string[];
      required?: boolean;
    }[];
  };
  report?: {
    summary: string;
    usageType: string;
    currentPlan: string;
    recommendedPlans: string[];
    recommendationReason: string;
    monthlySavingAmount: number;
    importantConditions: string[];
  };
}
