// AI 상담 관련 타입 정의.
export type ChatMode =
  | 'menu'
  | 'recommend'
  | 'compare'
  | 'subscribe'
  | 'general'
  | 'game'
  | 'attendance'
  | 'report'
  | 'out_of_scope';

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
  isLoggedIn?: boolean;
  // 요금제 비교 모드에서 비교할 두 요금제 이름.
  // 프론트엔드에서 "현재 요금제와 비교" 시 currentPlan + 추천 요금제 이름을 설정.
  comparePlanA?: string;
  comparePlanB?: string;
  // "다른 요금제 보기" 재질의 시 이미 추천한 요금제 planId 배열.
  // filterRecommendPlans에서 제외해 새로운 요금제가 추천되도록 함.
  excludePlanIds?: string[];
}

export interface RecommendedPlan {
  planId: string;
  planName: string;
  reason: string;
  savingAmount: number;
  monthlyFee?: number;
  data?: string;
  benefits?: string[];
  category?: string;
  targetAge?: string;
  dataSpeedAfter?: string;
  voice?: string;
  message?: string;
  shareData?: string;
  tethering?: string;
  notes?: string;
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
  compareResult?: CompareResult;
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

// CompareOutput에 프론트엔드 렌더링에 필요한 두 요금제 상세 정보를 추가한 비교 결과.
export interface CompareResult extends CompareOutput {
  planA: RecommendedPlan;
  planB: RecommendedPlan;
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
