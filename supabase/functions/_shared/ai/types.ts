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

// 최근 대화 맥락 한 턴. 슬롯 추출/의도 분류 시 LLM에 함께 전달한다.
export interface ConversationTurn {
  role: 'user' | 'ai';
  text: string;
}

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
  // 추천 정보 입력 폼에서 사용자가 "무관/미확인"을 선택해 명시적으로 건너뛴 필드명
  // (ageGroup/dataUsage/budget). 값이 비어있어도 buildInfoRequest/buildInfoForm이
  // 다시 물어보지 않도록 참고한다.
  skippedFields?: string[];
  // 최근 대화 맥락 (오래된 순, 최대 8턴). LLM 슬롯 추출/의도 분류에만 사용하며
  // 프로필로 누적 저장하지 않는다.
  history?: ConversationTurn[];
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
  // 대화에서 이미 파악된 초기값 — 폼을 미리 선택된 상태로 렌더링하기 위함
  value?: string | number | string[];
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
  reportKind?: 'plan' | 'general';
  // 상담에서 확정된 사용자 조건 요약
  userProfile?: string;
  // 가입 당시 현재(기존) 요금제 이름 — changedPlanAdvantage 생성에 사용
  currentPlan?: string;
  // 상담 중 실제로 가입/변경된 요금제 — 있으면 기존 요금제 대비 좋은 점을 생성한다
  changedPlan?: RecommendedPlan | null;
}

export interface ReportQAPair {
  question: string;
  answer: string;
}

// 추천/비교/가입 요금제는 클라이언트가 이미 구조화된 데이터로 갖고 있으므로,
// 이 Edge Function은 대화 요약(자유 서술 부분)만 생성한다.
export interface ReportOutput {
  // 레포트 목록에 쓰는 한 줄 요약 제목
  title: string;
  summary: string;
  usageType: string;
  importantConditions: string[];
  qaPairs: ReportQAPair[];
  // changedPlan이 있을 때만 생성되는, 기존 요금제 대비 좋은 점(200자 이내). 없으면 빈 문자열.
  changedPlanAdvantage: string;
}
