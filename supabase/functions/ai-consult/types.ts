// ai-consult Edge Function의 공개 요청/응답 타입.
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
  // 'plan' = 요금제 추천 기반 요약, 'general' = 일반 대화 요약
  reportKind?: 'plan' | 'general';
  // 상담에서 확정된 사용자 조건 요약
  userProfile?: string;
  // 요금제 비교용 필드
  comparePlanA?: string;
  comparePlanB?: string;
  // 추천 정보 입력 폼에서 사용자가 "무관/미확인"을 선택해 명시적으로 건너뛴 필드명
  skippedFields?: string[];
  // 최근 대화 맥락 (오래된 순, 최대 8턴) — LLM 슬롯 추출/의도 분류에 사용
  history?: { role: 'user' | 'ai'; text: string }[];
  // 상담 중 실제로 가입/변경된 요금제 — 레포트의 changedPlanAdvantage 생성용
  changedPlan?: {
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
  } | null;
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
      value?: string | number | string[];
    }[];
  };
  report?: {
    title: string;
    summary: string;
    usageType: string;
    importantConditions: string[];
    qaPairs: { question: string; answer: string }[];
    changedPlanAdvantage: string;
  };
  // 대화 맥락 분석으로 확정/조정/해제한 조건 슬롯의 최종 상태 — 클라이언트 프로필
  // 병합용. null은 "해제/미설정"을 의미하며 클라이언트는 해당 값을 지운다.
  resolvedSlots?: {
    ageGroup: string | null;
    dataUsage: number | null;
    budget: number | null;
    priority: 'budget' | 'data' | 'max_data' | null;
    ott: string[] | null;
    currentPlan: string | null;
  };
  // "처음부터 다시" 등으로 이전 조건을 전부 버렸는지 여부
  resetConditions?: boolean;
  compareResult?: {
    summary: string;
    planAAdvantage: string;
    planBAdvantage: string;
    recommendedPlanId: string;
    reason: string;
    planA: {
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
    };
    planB: {
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
    };
  };
}
