// AI 상담 관련 타입 정의.
export interface ConsultInput {
  currentPlan?: string;
  dataUsage?: number;
  voiceUsage?: number;
  smsUsage?: number;
  budget?: number;
  ott?: string[];
}

export interface RecommendedPlan {
  planId: string;
  planName: string;
  reason: string;
  savingAmount: number;
}

export interface RecommendOutput {
  recommendations: RecommendedPlan[];
}

export interface UsageAnalysisOutput {
  summary: string;
  averageDataUsageGB: number;
  averageVoiceUsageMin: number;
  averageSmsUsageCount: number;
  overUsageLikely: boolean;
  savingPotentialWon: number;
}
