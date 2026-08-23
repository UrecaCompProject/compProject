// ai-consult Edge Function의 공개 요청/응답 타입.
export type ChatMode =
  | 'menu'
  | 'recommend'
  | 'compare'
  | 'subscribe'
  | 'general'
  | 'game'
  | 'attendance';

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
}
