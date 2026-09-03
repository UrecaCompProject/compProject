// @ts-nocheck
// 사용자 발화 분석 — 정규식 파싱이 놓치는 자연어/맥락 참조를 LLM으로 보강한다.
// 실패하면 undefined를 반환하고, 호출부(ai-consult/index.ts)는 원본 입력 +
// 기존 정규식 경로(resolveNextMode / parseUserInput)로 폴백한다.
import { chatOpenAI } from './openai.ts';
import { extractPromptText } from './prompts/index.ts';
import { fillTemplate, safeJsonParse } from './recommend.ts';
import type { ChatMode, ConsultInput, ConversationTurn } from './types.ts';

const analyzeSystemPrompt =
  '당신은 통신 요금제 상담 입력 분석기입니다. 반드시 JSON으로만 답변하세요.';

const VALID_INTENTS: ChatMode[] = [
  'menu',
  'recommend',
  'compare',
  'subscribe',
  'general',
  'game',
  'attendance',
  'report',
  'out_of_scope',
];

const VALID_AGE_GROUPS = ['청소년', '20대', '30대', '40대', '50대 이상'];
const VALID_PRIORITIES = ['budget', 'data', 'max_data'];

// 사용자가 "무관/무제한"으로 해제할 수 있는 조건 슬롯
const CLEARABLE_SLOTS = new Set([
  'ageGroup',
  'dataUsage',
  'budget',
  'priority',
  'ott',
  'currentPlan',
]);

// 정규식이 결정적으로 처리하는 메뉴/네비게이션 버튼 문구 — LLM 분석을 건너뛰어
// 버튼 탭 시 불필요한 지연을 피한다.
const DETERMINISTIC_LABELS = new Set([
  '요금제 추천받기',
  '요금제 비교하기',
  '요금제 가입하기',
  '게임 하기',
  '출석 체크',
  '출석체크',
  '기타 상담',
  '회원 가입하기',
  '메뉴로 돌아가기',
  '처음으로',
  '메뉴',
  // 정보 입력 폼 제출 — 구조화된 값이 이미 채워져 있어 분석이 불필요
  '정보 입력 완료',
  '다른 요금제 보기',
  '새 조건으로 다시 추천받기',
]);

export interface AnalyzeSlots {
  ageGroup?: string;
  dataUsage?: number;
  budget?: number;
  priority?: ConsultInput['priority'];
  ott?: string[];
  currentPlan?: string;
  comparePlanA?: string;
  comparePlanB?: string;
}

export interface AnalyzeResult {
  intent?: ChatMode;
  slots: AnalyzeSlots;
  // 사용자가 제한을 해제하려는 슬롯 이름 목록 (예: "예산 무제한" → ['budget'])
  clear?: string[];
  // "처음부터 다시" 등 이전 조건을 전부 버리려는 발화
  resetConditions?: boolean;
}

// 응답으로 클라이언트에 돌려줄 조건 슬롯의 최종 상태 (null = 해제/미설정)
export interface ResolvedSlots {
  ageGroup: string | null;
  dataUsage: number | null;
  budget: number | null;
  priority: string | null;
  ott: string[] | null;
  currentPlan: string | null;
}

export interface ResolvedConditions {
  input: ConsultInput;
  slots: ResolvedSlots;
  resetConditions: boolean;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(/[^\d.]/g, ''));
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

// LLM 원시 출력을 스키마에 맞게 정제. 알 수 없는 값은 버린다.
function sanitize(raw: {
  intent?: string;
  slots?: Record<string, unknown>;
  clear?: unknown;
  resetConditions?: unknown;
}): AnalyzeResult {
  const slots: AnalyzeSlots = {};
  const s = raw.slots ?? {};

  if (typeof s.ageGroup === 'string' && VALID_AGE_GROUPS.includes(s.ageGroup))
    slots.ageGroup = s.ageGroup;

  const dataUsage = toNumber(s.dataUsage);
  if (dataUsage !== undefined && dataUsage >= 0) slots.dataUsage = dataUsage;

  const budget = toNumber(s.budget);
  if (budget !== undefined && budget >= 0) slots.budget = Math.round(budget);

  if (typeof s.priority === 'string' && VALID_PRIORITIES.includes(s.priority))
    slots.priority = s.priority as ConsultInput['priority'];

  if (Array.isArray(s.ott)) {
    const ott = s.ott.filter((o): o is string => typeof o === 'string' && !!o);
    if (ott.length > 0) slots.ott = ott;
  }

  if (typeof s.currentPlan === 'string' && s.currentPlan.trim())
    slots.currentPlan = s.currentPlan.trim();
  if (typeof s.comparePlanA === 'string' && s.comparePlanA.trim())
    slots.comparePlanA = s.comparePlanA.trim();
  if (typeof s.comparePlanB === 'string' && s.comparePlanB.trim())
    slots.comparePlanB = s.comparePlanB.trim();

  const intent =
    typeof raw.intent === 'string' &&
    VALID_INTENTS.includes(raw.intent as ChatMode)
      ? (raw.intent as ChatMode)
      : undefined;

  const clear = Array.isArray(raw.clear)
    ? raw.clear.filter(
        (c): c is string => typeof c === 'string' && CLEARABLE_SLOTS.has(c),
      )
    : [];

  return {
    intent,
    slots,
    clear: clear.length > 0 ? clear : undefined,
    resetConditions: raw.resetConditions === true,
  };
}

function formatHistory(history: ConversationTurn[] | undefined): string {
  if (!history || history.length === 0) return '(없음)';
  return history
    .slice(-8)
    .map((h) => `${h.role === 'user' ? '사용자' : 'AI'}: ${h.text}`)
    .join('\n');
}

export async function analyzeInput(
  input: ConsultInput,
): Promise<AnalyzeResult | undefined> {
  const userMessage = (input.userMessage ?? '').trim();
  if (!userMessage) return undefined;
  if (DETERMINISTIC_LABELS.has(userMessage)) return undefined;

  const knownProfile = JSON.stringify({
    ageGroup: input.ageGroup ?? null,
    dataUsage: input.dataUsage ?? null,
    budget: input.budget ?? null,
    priority: input.priority ?? null,
    ott: input.ott ?? [],
    currentPlan: input.currentPlan ?? null,
  });

  const filledPrompt = fillTemplate(extractPromptText, {
    history: formatHistory(input.history),
    userMessage,
    knownProfile,
  });

  try {
    const raw = await chatOpenAI(analyzeSystemPrompt, filledPrompt, 300, true);
    const parsed = safeJsonParse<{
      intent?: string;
      slots?: Record<string, unknown>;
      clear?: unknown;
      resetConditions?: unknown;
    }>(raw);
    if (!parsed) return undefined;
    return sanitize(parsed);
  } catch {
    return undefined;
  }
}

// 분석 결과를 입력에 반영해 이번 턴의 "조건 최종 상태"를 만든다.
// - resetConditions면 이전 조건을 모두 버리고 이번 발화 값만 사용한다.
// - LLM이 값을 돌려준 슬롯은 그 값을 채택한다(프롬프트가 "확정된 값은 그대로,
//   바뀐 값만" 반환하도록 지시하므로). 예: "예산 5만원으로" → 40000→50000.
// - clear에 담긴 슬롯은 제한을 해제한다(undefined). 예: "예산 무제한" → budget 제거.
// slots(ResolvedSlots)는 클라이언트 프로필에 병합해 다음 턴에도 이어지도록 반환한다.
export function resolveConditions(
  body: ConsultInput,
  analyzed: AnalyzeResult,
): ResolvedConditions {
  const reset = analyzed.resetConditions === true;
  const merged: ConsultInput = reset
    ? {
        userMessage: body.userMessage,
        isLoggedIn: body.isLoggedIn,
        history: body.history,
        mode: 'recommend',
      }
    : { ...body };

  const s = analyzed.slots;
  if (s.ageGroup !== undefined) merged.ageGroup = s.ageGroup;
  if (s.dataUsage !== undefined) merged.dataUsage = s.dataUsage;
  if (s.budget !== undefined) merged.budget = s.budget;
  if (s.priority !== undefined) merged.priority = s.priority;
  if (s.ott && s.ott.length > 0) merged.ott = s.ott;
  if (s.currentPlan !== undefined) merged.currentPlan = s.currentPlan;
  if (s.comparePlanA !== undefined) merged.comparePlanA = s.comparePlanA;
  if (s.comparePlanB !== undefined) merged.comparePlanB = s.comparePlanB;

  for (const name of analyzed.clear ?? []) {
    (merged as Record<string, unknown>)[name] = undefined;
  }

  return {
    input: merged,
    slots: {
      ageGroup: merged.ageGroup ?? null,
      dataUsage: merged.dataUsage ?? null,
      budget: merged.budget ?? null,
      priority: merged.priority ?? null,
      ott: merged.ott && merged.ott.length > 0 ? merged.ott : null,
      currentPlan: merged.currentPlan ?? null,
    },
    resetConditions: reset,
  };
}
