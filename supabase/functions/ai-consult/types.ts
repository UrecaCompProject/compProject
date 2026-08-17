// ai-consult Edge Function의 공개 요청/응답 타입.
export interface ConsultRequest {
  currentPlan?: string;
  dataUsage?: number;
  voiceUsage?: number;
  smsUsage?: number;
  budget?: number;
  ott?: string[];
}

export interface ConsultResponse {
  recommendations: {
    planId: string;
    planName: string;
    reason: string;
    savingAmount: number;
  }[];
}
