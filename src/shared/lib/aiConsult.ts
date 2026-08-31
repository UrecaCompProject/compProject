import { supabase } from './supabaseClient';

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
  conversation?: string;
  recommendationResult?: string;
  // 요금제 비교 모드에서 비교할 두 요금제 이름
  comparePlanA?: string;
  comparePlanB?: string;
  // "다른 요금제 보기" 재질의 시 이미 추천한 요금제 planId 배열
  excludePlanIds?: string[];
}

export interface ReportInput {
  conversation: string;
  currentPlan: string;
  recommendationResult: string;
  // 'plan' = 요금제 추천 기반 요약, 'general' = 일반 대화 요약 (요금제 필드 빈값)
  reportKind?: 'plan' | 'general';
  // 상담에서 확정된 사용자 조건 요약(연령, 데이터, 예산, OTT 등)
  userProfile?: string;
}

export interface RecommendedPlan {
  planId: string;
  planName: string;
  reason: string;
  savingAmount: number;
  monthlyFee?: number;
  data?: string;
  dataAmountGb?: number;
  benefits?: string[];
  category?: string;
  targetAge?: string;
  dataSpeedAfter?: string;
  voice?: string;
  callAmountMin?: number;
  message?: string;
  smsAmount?: number;
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

export interface ConsultResponse {
  recommendations: RecommendedPlan[];
  notice?: string;
  quickReplies?: string[];
  mode?: ChatMode;
  form?: ConsultForm;
  report?: ReportOutput;
  compareResult?: CompareResult;
}

export interface ReportQAPair {
  question: string;
  answer: string;
}

export interface ReportOutput {
  summary: string;
  usageType: string;
  currentPlan: string;
  recommendedPlans: string[];
  recommendationReason: string;
  monthlySavingAmount: number;
  importantConditions: string[];
  qaPairs: ReportQAPair[];
}

export interface CompareResult {
  summary: string;
  planAAdvantage: string;
  planBAdvantage: string;
  recommendedPlanId: string;
  reason: string;
  planA: RecommendedPlan;
  planB: RecommendedPlan;
}

// Edge Function 응답 대기 최대 시간 (밀리초)
const CONSULT_TIMEOUT_MS = 30_000;
const REPORT_TIMEOUT_MS = 60_000;

// Supabase Edge Function 'ai-consult'를 호출하여 AI 요금제 추천 결과를 받습니다.
// signal을 전달하면 호출 도중에 요청을 취소할 수 있습니다.
export async function requestConsult(
  input: ConsultInput,
  signal?: AbortSignal,
): Promise<ConsultResponse> {
  const { data, error } = await supabase.functions.invoke<ConsultResponse>(
    'ai-consult',
    {
      body: input,
      timeout: CONSULT_TIMEOUT_MS,
      signal,
    },
  );

  if (error) {
    throw new Error(`AI 상담 요청 실패: ${error.message}`);
  }

  if (!data) {
    throw new Error('AI 상담 응답이 비어 있습니다.');
  }

  return data;
}

// 상담 내용과 추천 결과를 바탕으로 요약 레포트를 생성합니다.
// signal을 전달하면 레포트 생성 도중에 요청을 취소할 수 있습니다.
export async function generateReport(
  input: ReportInput,
  signal?: AbortSignal,
): Promise<ReportOutput> {
  const { data, error } = await supabase.functions.invoke<{
    report: ReportOutput;
    mode: 'report';
  }>('ai-consult', {
    body: { ...input, mode: 'report' },
    timeout: REPORT_TIMEOUT_MS,
    signal,
  });

  if (error) {
    throw new Error(`레포트 생성 실패: ${error.message}`);
  }

  if (!data?.report) {
    throw new Error('레포트 응답이 비어 있습니다.');
  }

  return data.report;
}
