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
  // 추천 정보 입력 폼에서 사용자가 "무관/미확인"을 선택해 명시적으로 건너뛴 필드명
  // (ageGroup/dataUsage/budget). 값이 비어있어도 다시 물어보지 않도록 서버가 참고한다.
  skippedFields?: string[];
}

export interface ReportInput {
  conversation: string;
  // 'plan' = 요금제 추천 기반 요약, 'general' = 일반 대화 요약 (요금제 필드 빈값)
  reportKind?: 'plan' | 'general';
  // 상담에서 확정된 사용자 조건 요약(연령, 데이터, 예산, OTT 등)
  userProfile?: string;
  // 가입 당시 현재(기존) 요금제 이름 — changedPlanAdvantage 생성에 사용
  currentPlan?: string;
  // 상담 중 실제로 가입/변경된 요금제 — 있으면 기존 요금제 대비 좋은 점을 생성한다
  changedPlan?: RecommendedPlan | null;
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

// Edge Function이 LLM으로 생성하는 자유 대화 요약 — 요금제 관련 값은
// 클라이언트가 이미 정확히 알고 있으므로(추천/비교/가입 이벤트) LLM은
// 이 부분만 담당한다.
export interface ReportNotes {
  // 레포트 목록(PreviewReport)에 쓰는 한 줄 요약 제목 (예: "데이터 중심 20대 요금제 상담")
  title: string;
  summary: string;
  usageType: string;
  importantConditions: string[];
  qaPairs: ReportQAPair[];
  // changedPlan이 있을 때만 채워지는, 기존 요금제 대비 좋은 점(200자 이내)
  changedPlanAdvantage: string;
}

// 상담 중 "요금제 추천받기"가 한 번 이상 요청될 때마다 생기는 한 라운드.
// target: 그 시점의 확정 조건("20대 / 5GB ~ 10GB / 5만원 ~ 10만원 / 넷플릭스").
//         priority(정렬 기준)는 사용자에게 보여줄 "조건"이 아니라서 제외한다.
// detail: 이 라운드를 요청하게 만든 문구 — 첫 추천은 '', 이후 "데이터가 더 큰
//         요금제 보기" 같은 재질의는 그 문구 그대로
// groupId: 같은 정보 입력(폼)에서 이어진 재질의들을 하나로 묶는 식별자 — 폼을
//          새로 제출하기 전까지는 퀵리플라이 재질의 라운드가 전부 같은 값을 공유한다.
export interface RecommendedPlanGroup {
  groupId: string;
  target: string;
  detail: string;
  plans: RecommendedPlan[];
}

export interface ReportOutput {
  // 가입 당시 현재 요금제 — 클라이언트 값을 그대로 사용(표시용)
  currentPlan: string;
  // 상담 중 "요금제 추천받기" 요청마다 생긴 라운드를 전부 담는다 (여러 번 추천받았으면 여러 개)
  recommendedPlans: RecommendedPlanGroup[];
  // 상담 중 마지막으로 비교했던 요금제 결과
  comparedPlan: CompareResult | null;
  // 상담 중 실제로 가입/변경된 요금제
  changedPlan: RecommendedPlan | null;
  otherNotes: ReportNotes;
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

// 상담 대화 로그를 바탕으로 자유 대화 요약(ReportNotes)을 생성합니다.
// 추천/비교/가입 요금제 등 구조화 데이터는 클라이언트가 이미 갖고 있으므로
// 이 함수는 그 나머지(요약/사용자유형/핵심조건/QA)만 담당합니다.
// signal을 전달하면 레포트 생성 도중에 요청을 취소할 수 있습니다.
export async function generateReport(
  input: ReportInput,
  signal?: AbortSignal,
): Promise<ReportNotes> {
  const { data, error } = await supabase.functions.invoke<{
    report: ReportNotes;
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
