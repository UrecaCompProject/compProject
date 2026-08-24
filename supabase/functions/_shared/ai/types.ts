// AI 상담 관련 타입 정의.
export type ChatMode =
  | 'menu'
  | 'recommend'
  | 'compare'
  | 'subscribe'
  | 'general'
  | 'game'
  | 'attendance';

export interface ConsultInput {
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

export interface RecommendedPlan {
  planId: string;
  planName: string;
  reason: string;
  savingAmount: number;
  monthlyFee?: number;
  data?: string;
  benefits?: string[];
}

export interface ConsultFormField {
  name: string;
  label: string;
  type: 'select' | 'number' | 'text' | 'multi-select';
  options?: string[];
  required?: boolean;
}

export interface ConsultForm {
  title?: string;
  fields: ConsultFormField[];
}

export interface RecommendOutput {
  recommendations: RecommendedPlan[];
  notice?: string;
  quickReplies?: string[];
  mode?: ChatMode;
  form?: ConsultForm;
}

export interface UsageAnalysisOutput {
  summary: string;
  averageDataUsageGB: number;
  averageVoiceUsageMin: number;
  averageSmsUsageCount: number;
  overUsageLikely: boolean;
  savingPotentialWon: number;
}

export interface CompareInput {
  userProfile: string;
  usageAnalysis: string;
  planA: string;
  planB: string;
}

export interface CompareOutput {
  summary: string;
  planAAdvantage: string;
  planBAdvantage: string;
  recommendedPlanId: string;
  reason: string;
}

export interface ReportInput {
  conversation: string;
  currentPlan: string;
  recommendationResult: string;
}

export interface ReportOutput {
  summary: string;
  usageType: string;
  currentPlan: string;
  recommendedPlans: string[];
  recommendationReason: string;
  monthlySavingAmount: number;
  importantConditions: string[];
}
