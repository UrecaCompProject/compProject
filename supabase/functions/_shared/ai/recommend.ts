// @ts-nocheck
// LangChain 없이 OpenAI /v1/chat/completions를 직접 호출하는 요금제 추천 로직.
import { loadPlans } from './data.ts';
import type { Plan } from './data.ts';
import {
  comparePromptText,
  generalReportPromptText,
  noticePromptText,
  reasonPromptText,
  reportPromptText,
} from './prompts/index.ts';
import { chatOpenAI } from './openai.ts';
import type {
  ChatMode,
  CompareResult,
  ConsultForm,
  ConsultInput,
  RecommendOutput,
  RecommendedPlan,
  ReportInput,
  ReportOutput,
} from './types.ts';

const noticeSystemPrompt =
  '당신은 통신 요금제 안내 문구 작성 AI입니다. 제공된 조건과 추천 후보를 바탕으로 1-2문장의 안내 문구를 JSON 형식으로 작성하세요.';

// JSON 문자열을 안전하게 파싱. LLM이 마크다운 코드 블록으로 감싸 출력하거나 불완전한 JSON을 내놓을 경우를 대비.
function safeJsonParse<T>(text: string): T | undefined {
  const cleaned = text
    .replace(/^```json\s*/, '')
    .replace(/```\s*$/, '')
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}

// 요금제 데이터 용량 문자열을 GB 단위 숫자로 변환.
function parseDataGB(value: string): number {
  if (value === '무제한') return 1000;
  const mb = value.match(/^([\d.]+)MB$/);
  if (mb) return parseFloat(mb[1]) / 1000;
  const gb = value.match(/^([\d.]+)GB$/);
  return gb ? parseFloat(gb[1]) : 0;
}

// 사용자 연령대와 요금제 가입 대상이 맞는지 확인.
function ageMatches(ageGroup: string | undefined, targetAge: string): boolean {
  if (!ageGroup || ageGroup === '미제공') return true;
  if (targetAge === '일반') return true;
  return targetAge.includes(ageGroup);
}

// OTT 혜택 문자열과 사용자 OTT 선호 목록이 겹치는지 확인.
function hasOttMatch(
  ott: string[] | undefined,
  benefits: string[] | undefined,
): boolean {
  if (!ott || ott.length === 0) return false;
  const benefitText = (benefits ?? []).join(' ').toLowerCase();
  return ott.some((o) => benefitText.includes(o.toLowerCase()));
}

// 추천 전 반드시 필요한 정보가 누락되었는지 확인.
// skippedFields에 있는 필드는 사용자가 "무관/미확인"을 명시적으로 선택한 것이므로
// 값이 비어있어도(undefined) 다시 묻지 않는다 — "아직 안 물어봄"과 구분하기 위한 용도.
function buildInfoRequest(input: ConsultInput): string | undefined {
  const skipped = input.skippedFields ?? [];
  const critical: string[] = [];
  if (
    (!input.ageGroup || input.ageGroup === '미제공') &&
    !skipped.includes('ageGroup')
  )
    critical.push('나이');
  if (input.dataUsage === undefined && !skipped.includes('dataUsage'))
    critical.push('월 데이터 사용량');

  if (critical.length === 0) return undefined;

  if (input.budget === undefined && !skipped.includes('budget'))
    critical.push('예산');
  // 나열된 항목 각각에 조사를 붙이면 "나이를, 예산을"처럼 어색해지므로,
  // 마지막 항목에만 조사를 붙인다 (예: "나이, 데이터 사용량, 예산을").
  const last = critical[critical.length - 1];
  const requestText = [...critical.slice(0, -1), josa(last, '을/를')].join(
    ', ',
  );
  return `상세 정보를 입력하시면 더 자세한 맞춤 요금제를 추천해드릴 수 있어요! (${requestText} 알려주세요)`;
}

// 누락된 추천 조건을 form으로 입력받을 수 있도록 구성합니다.
function buildInfoForm(input: ConsultInput): ConsultForm {
  const skipped = input.skippedFields ?? [];
  const fields: ConsultForm['fields'] = [];

  if (
    (!input.ageGroup || input.ageGroup === '미제공') &&
    !skipped.includes('ageGroup')
  ) {
    fields.push({
      name: 'ageGroup',
      label: '나이',
      type: 'select',
      options: ['청소년', '20대', '30대', '40대', '50대 이상'],
      required: true,
    });
  }

  if (input.dataUsage === undefined && !skipped.includes('dataUsage')) {
    fields.push({
      name: 'dataUsage',
      label: '월 데이터 사용량',
      type: 'number',
      required: true,
    });
  }

  if (input.budget === undefined && !skipped.includes('budget')) {
    fields.push({
      name: 'budget',
      label: '예산 (원)',
      type: 'number',
      required: true,
    });
  }

  fields.push({
    name: 'priority',
    label: '우선순위',
    type: 'select',
    options: ['budget', 'data', 'max_data'],
    required: false,
  });

  const ottOptions = [
    '넷플릭스',
    '유튜브 프리미엄',
    '디즈니+',
    '왓챠',
    '웨이브',
    '쿠팡플레이',
    '애플 뮤직',
    '멜론',
    '스포티파이',
  ];
  fields.push({
    name: 'ott',
    label: 'OTT 혜택',
    type: 'multi-select',
    options: ottOptions,
    required: false,
  });

  return { title: '추천을 위해 필요한 정보', fields };
}

// 받침 유무에 따른 조사 선택.
function josa(word: string, tail: string): string {
  const last = word[word.length - 1];
  const code = last.charCodeAt(0) - 0xac00;
  const hasJong = code % 28 !== 0;
  return word + (hasJong ? tail[0] : tail[2]);
}

// 우선순위별 후보 필터 단계를 정의합니다.
type PlanFilter = (p: Plan) => boolean;

function buildCandidateFilters(input: ConsultInput): PlanFilter[] {
  const dataUsage = input.dataUsage ?? 0;
  const budget = input.budget ?? Number.MAX_SAFE_INTEGER;
  const ageGroup = input.ageGroup;
  const ott = input.ott;

  const ageOk = (p: Plan) => ageMatches(ageGroup, p.target_age);

  const filtersByPriority: Record<
    NonNullable<ConsultInput['priority']>,
    PlanFilter[]
  > = {
    max_data: [(p) => ageOk(p) && p.monthly_fee <= budget, (p) => ageOk(p)],
    data: [
      (p) =>
        ageOk(p) && parseDataGB(p.data) >= dataUsage && p.monthly_fee <= budget,
      (p) => ageOk(p) && parseDataGB(p.data) >= dataUsage,
      (p) => ageOk(p) && parseDataGB(p.data) >= dataUsage * 0.7,
      (p) => ageOk(p) && p.monthly_fee <= budget,
    ],
    budget: [
      (p) =>
        ageOk(p) &&
        p.monthly_fee <= budget &&
        parseDataGB(p.data) >= dataUsage &&
        hasOttMatch(ott, p.benefits),
      (p) =>
        ageOk(p) &&
        p.monthly_fee <= budget &&
        parseDataGB(p.data) >= dataUsage * 0.7 &&
        hasOttMatch(ott, p.benefits),
      (p) =>
        ageOk(p) && p.monthly_fee <= budget && parseDataGB(p.data) >= dataUsage,
      (p) =>
        ageOk(p) &&
        p.monthly_fee <= budget &&
        parseDataGB(p.data) >= dataUsage * 0.7,
      (p) => ageOk(p) && p.monthly_fee <= budget,
    ],
  };

  return filtersByPriority[input.priority ?? 'budget'];
}

// 후보 요금제를 점수로 정렬하고 상위 5개를 반환합니다.
function scoreCandidates(candidates: Plan[], input: ConsultInput): Plan[] {
  const dataUsage = input.dataUsage ?? 0;
  const priority = input.priority ?? 'budget';
  const ott = input.ott;
  const DATA_WEIGHT = 1_000_000;

  return candidates
    .map((p) => {
      const dataValue = parseDataGB(p.data);
      const isExact = dataValue >= dataUsage;
      const ottBonus = hasOttMatch(ott, p.benefits) ? 1_000 : 0;

      let score: number;
      if (priority === 'max_data') {
        score = -dataValue * DATA_WEIGHT + p.monthly_fee - ottBonus;
      } else if (priority === 'data') {
        score = p.monthly_fee - ottBonus;
      } else {
        const EXACT_BONUS = 2_000 * DATA_WEIGHT;
        score = isExact
          ? p.monthly_fee - ottBonus
          : EXACT_BONUS - dataValue * DATA_WEIGHT + p.monthly_fee - ottBonus;
      }
      return { plan: p, score };
    })
    .sort((a, b) => a.score - b.score)
    .map((x) => x.plan)
    .slice(0, 5);
}

// 사용자 조건에 맞는 상위 후보 요금제만 추려 prompt 길이를 줄임.
function filterRecommendPlans(plans: Plan[], input: ConsultInput): Plan[] {
  // "다른 요금제 보기" 재질의 시 이미 추천한 요금제를 제외
  const excludeIds = new Set(
    (input.excludePlanIds ?? []).map((id) => String(id)),
  );
  const availablePlans =
    excludeIds.size > 0
      ? plans.filter((p) => !excludeIds.has(String(p.id)))
      : plans;

  const filters = buildCandidateFilters(input);
  let candidates: Plan[] = [];

  for (const filter of filters) {
    candidates = availablePlans.filter(filter);
    if (candidates.length >= 3) break;
  }

  if (candidates.length === 0) {
    candidates = availablePlans.filter((p) =>
      ageMatches(input.ageGroup, p.target_age),
    );
  }

  const ott = input.ott;
  if (ott && ott.length > 0) {
    const seen = new Set(candidates.map((p) => p.id));
    for (const p of availablePlans) {
      if (
        ageMatches(input.ageGroup, p.target_age) &&
        hasOttMatch(ott, p.benefits) &&
        !seen.has(p.id)
      ) {
        candidates.push(p);
      }
    }
  }

  return scoreCandidates(candidates, input);
}

// 현재 요금제의 월 요금을 찾음. 없으면 0.
function findCurrentPlanFee(
  plans: Plan[],
  currentPlanName: string | undefined,
): number {
  if (!currentPlanName || currentPlanName === '미등록') return 0;
  const found = plans.find((p) => p.name === currentPlanName);
  return found?.monthly_fee ?? 0;
}

const reasonSystemPrompt = `
당신은 통신 요금제 추천 사유 작성 AI입니다.
제공된 사용자 조건과 요금제 데이터만 사용해 각 후보의 추천 사유를 JSON 형식으로 작성하세요.
존재하지 않는 가격, 데이터 용량, 혜택을 임의로 만들지 마세요.
`;

// 코드 기반 fallback 사유 생성.
function buildCodeReason(plan: Plan, saving: number): string {
  let reason = `데이터 ${plan.data}, 월 ${plan.monthly_fee.toLocaleString()}원이에요.`;
  if (saving > 0) {
    reason += ` 현재 요금제보다 월 ${saving.toLocaleString()}원 절감돼요.`;
  }
  return reason;
}

// LLM 출력을 실제 데이터로 보정하고, 이유는 OpenAI로 생성하되 실패 시 코드 fallback.
async function sanitizeRecommendations(
  output: RecommendOutput,
  plans: Plan[],
  input: ConsultInput,
): Promise<RecommendOutput> {
  const currentPlanFee = findCurrentPlanFee(plans, input.currentPlan);

  const valid = output.recommendations
    .map((r) => {
      const plan = plans.find((p) => String(p.id) === String(r.planId));
      if (!plan) return null;
      const saving =
        currentPlanFee > 0 ? Math.max(0, currentPlanFee - plan.monthly_fee) : 0;
      return {
        planId: String(plan.id),
        planName: plan.name,
        plan,
        savingAmount: saving,
      };
    })
    .filter(
      (
        r,
      ): r is {
        planId: string;
        planName: string;
        plan: Plan;
        savingAmount: number;
      } => r !== null,
    );

  const plansText = valid.slice(0, 3).map(formatPlanForPrompt).join('\n');
  const filledPrompt = fillTemplate(reasonPromptText, {
    ageGroup: input.ageGroup ?? '미제공',
    dataUsage: String(input.dataUsage ?? 0),
    budget: input.budget ? String(input.budget) : '제한 없음',
    currentPlan: input.currentPlan ?? '미등록',
    priority: input.priority ?? 'budget',
    ott: input.ott?.join(', ') || '없음',
    plans: plansText,
  });

  let reasonByPlanId: Record<string, string> | undefined;
  try {
    const raw = await chatOpenAI(reasonSystemPrompt, filledPrompt);
    const parsed = safeJsonParse<{
      reasons: { planId: string; reason: string }[];
    }>(raw);
    if (parsed?.reasons) {
      reasonByPlanId = Object.fromEntries(
        parsed.reasons.map((r) => [String(r.planId), r.reason]),
      );
    }
  } catch {
    reasonByPlanId = undefined;
  }

  const recommendations: RecommendedPlan[] = valid.slice(0, 3).map((r) => ({
    planId: r.planId,
    planName: r.planName,
    reason:
      reasonByPlanId?.[r.planId] || buildCodeReason(r.plan, r.savingAmount),
    savingAmount: r.savingAmount,
    monthlyFee: r.plan.monthly_fee,
    data: r.plan.data,
    benefits: r.plan.benefits,
    category: r.plan.category,
    targetAge: r.plan.target_age,
    dataSpeedAfter: r.plan.data_speed_after,
    voice: r.plan.voice,
    message: r.plan.message,
    shareData: r.plan.share_data,
    tethering: r.plan.tethering,
    notes: r.plan.notes,
  }));

  return { recommendations };
}

// 예산 내에서 요청한 데이터 용량을 충족하는 요금제가 없을 때 안내 문구 생성.
function buildNotice(plans: Plan[], input: ConsultInput): string | undefined {
  if (input.budget === undefined) {
    return '예산을 알 수 없어 예산 제한 없이 가장 가까운 요금제를 추천해드릴게요. 예산을 알려주시면 더 정확한 맞춤 추천이 가능해요.';
  }

  const dataUsage = input.dataUsage ?? 0;
  const budget = input.budget ?? Number.MAX_SAFE_INTEGER;
  const ageGroup = input.ageGroup;

  const hasExactInBudget = plans.some(
    (p) =>
      ageMatches(ageGroup, p.target_age) &&
      p.monthly_fee <= budget &&
      parseDataGB(p.data) >= dataUsage,
  );
  if (hasExactInBudget) return undefined;

  if (input.priority === 'max_data') {
    const budgetPlans = plans.filter(
      (p) => ageMatches(ageGroup, p.target_age) && p.monthly_fee <= budget,
    );
    if (budgetPlans.length > 0) {
      const countSuffix =
        budgetPlans.length < 3
          ? ` (예산 내 후보가 ${budgetPlans.length}개뿐입니다.)`
          : '';
      return `예산 ${budget.toLocaleString()}원 내에서 데이터가 많은 순으로 추천해드리겠습니다.${countSuffix}`;
    }
    return `예산 ${budget.toLocaleString()}원 내의 요금제가 없어 연령대 기준으로 추천해드리겠습니다.`;
  }

  if (input.priority === 'data') {
    const hasExactAny = plans.some(
      (p) =>
        ageMatches(ageGroup, p.target_age) && parseDataGB(p.data) >= dataUsage,
    );
    if (hasExactAny) {
      const overBudgetSuffix = !hasExactInBudget
        ? ' (추천되는 요금제는 모두 예산을 초과할 수 있습니다.)'
        : '';
      return `예산 ${budget.toLocaleString()}원 내에서는 데이터 ${dataUsage}GB 이상인 요금제가 없어, 데이터를 충족하는 요금제 중 가장 저렴한 순으로 추천해드리겠습니다.${overBudgetSuffix}`;
    }
    return `데이터 ${dataUsage}GB 이상 요금제가 없어 가장 비슷한 용량의 요금제부터 추천해드리겠습니다.`;
  }
  if (
    input.ott &&
    input.ott.length > 0 &&
    plans.some(
      (p) =>
        ageMatches(ageGroup, p.target_age) &&
        parseDataGB(p.data) >= dataUsage &&
        hasOttMatch(input.ott, p.benefits),
    )
  ) {
    return '예산 범위 내에는 없지만 OTT 혜택이 포함된 요금제를 함께 보여드릴게요.';
  }
  return '예산 범위 내에 데이터 용량을 만족하는 요금제가 없어 가격 내에서 가장 용량이 큰 순서대로 추천해드리겠습니다.';
}

// 통신 요금제 상담과 관련된 키워드 목록 — 상담 외 입력 감지에 사용
// 주의: 이 배열은 src/features/ai-consult/constants/telecomKeywords.ts에서 자동 생성됩니다.
// 직접 수정하지 말고 프론트엔드 소스를 수정 후 npm run sync:keywords를 실행하세요.
const TELECOM_KEYWORDS = [
  '요금제',
  '데이터',
  '통화',
  '문자',
  'SMS',
  '예산',
  '비용',
  '요금',
  '가입',
  '해지',
  '변경',
  '신청',
  '추천',
  '비교',
  '할인',
  '혜택',
  'OTT',
  '넷플릭스',
  '유튜브',
  '디즈니',
  '왓챠',
  '웨이브',
  '쿠팡',
  'USIM',
  '유심',
  'eSIM',
  '번호이동',
  '기기변경',
  '신규',
  '5G',
  'LTE',
  '무제한',
  '기가',
  'GB',
  '청소년',
  '어르신',
  '시니어',
  '월정액',
  '부가통화',
  '데이터공유',
  '테더링',
  '속도',
  '레포트',
  '리포트',
  '상담',
  '문의',
  '메뉴',
  '처음',
  '돌아가기',
  '게임',
  '퀴즈',
  '출석',
  '출첵',
  '안녕',
  '도움',
];

// 사용자 입력이 통신 상담과 관련 있는지 판별
function isTelecomRelated(text: string): boolean {
  const normalized = text.toLowerCase().replace(/\s+/g, '');
  return TELECOM_KEYWORDS.some((kw) =>
    normalized.includes(kw.toLowerCase().replace(/\s+/g, '')),
  );
}

// 사용자 메시지와 이전 모드에서 다음 단계 모드를 결정합니다.
function resolveNextMode(input: ConsultInput): ChatMode {
  const t = (input.userMessage || '').trim();
  const current = input.mode ?? 'menu';

  if (current === 'report') return 'report';
  if (/^메뉴|^처음|^처음으로|^돌아가기|^안녕|^시작/.test(t)) return 'menu';
  if (/요금제\s*추천|추천받기|맞춤\s*추천/.test(t)) return 'recommend';
  if (/요금제\s*비교|비교\s*하기|비교해/.test(t)) return 'compare';
  if (/요금제\s*가입|가입\s*하기|신청/.test(t)) return 'subscribe';
  if (/상담|문의|질문|도움/.test(t)) return 'general';
  if (/게임|미니게임/.test(t)) return 'game';
  if (/출석|출첵|출석체크/.test(t)) return 'attendance';
  if (/레포트|리포트|레포트\s*생성|리포트\s*생성/.test(t)) return 'report';

  // 메뉴 상태에서 통신과 무관한 입력은 상담 외 주제로 분기
  if (current === 'menu' && t.length > 0 && !isTelecomRelated(t)) {
    return 'out_of_scope';
  }

  // 이전 모드를 유지하며, 메뉴라면 추천으로 전진시킵니다.
  if (current === 'menu' && t.length > 0) return 'recommend';
  return current;
}

// 초기 메뉴 응답. 로그인 여부에 따라 가입 버튼을 다르게 노출.
function buildMenuResponse(isLoggedIn: boolean): RecommendOutput {
  return {
    recommendations: [],
    notice: '원하시는 메뉴를 선택해 주세요.',
    quickReplies: isLoggedIn
      ? [
          '요금제 추천받기',
          '요금제 비교하기',
          '요금제 가입하기',
          '게임 하기',
          '출석체크',
          '기타 상담',
        ]
      : ['회원 가입하기', '요금제 추천받기', '요금제 비교하기', '기타 상담'],
    mode: 'menu',
  };
}

// 요금제 비교 기초 응답. 비로그인 시 현재 요금제 비교는 회원가입 유도.
function buildCompareResponse(isLoggedIn: boolean): RecommendOutput {
  return {
    recommendations: [],
    notice: isLoggedIn
      ? '비교할 요금제를 알려주세요. 현재 요금제와 추천 요금제를 비교하거나, 두 요금제 이름을 직접 입력할 수 있어요.'
      : '현재 요금제와 비교는 로그인 후에 이용할 수 있어요.',
    quickReplies: isLoggedIn
      ? ['현재 요금제와 비교', '요금제 이름 직접 입력', '메뉴로 돌아가기']
      : ['회원 가입하기', '요금제 이름 직접 입력', '메뉴로 돌아가기'],
    mode: 'compare',
  };
}

// Plan을 RecommendedPlan으로 변환.
function planToRecommendedPlan(plan: Plan): RecommendedPlan {
  return {
    planId: String(plan.id),
    planName: plan.name,
    reason: '',
    savingAmount: 0,
    monthlyFee: plan.monthly_fee,
    data: plan.data,
    benefits: plan.benefits,
    category: plan.category,
    targetAge: plan.target_age,
    dataSpeedAfter: plan.data_speed_after,
    voice: plan.voice,
    message: plan.message,
    shareData: plan.share_data,
    tethering: plan.tethering,
    notes: plan.notes,
  };
}

// 사용자 메시지에서 요금제 이름 두 개를 식별.
function parseComparePlanNames(
  message: string,
  plans: Plan[],
): [string, string] | undefined {
  const found = plans.filter((p) => message.includes(p.name));
  if (found.length >= 2) return [found[0].name, found[1].name];
  return undefined;
}

// LLM 실패 시 코드 기반 fallback 비교 결과 생성.
function buildCodeCompareResult(planA: Plan, planB: Plan): CompareResult {
  const feeDiff = planA.monthly_fee - planB.monthly_fee;
  const summary = `${planA.name}과(와) ${planB.name}을(를) 비교한 결과입니다.`;
  const planAAdvantage =
    feeDiff > 0
      ? `${planB.name}보다 월 ${feeDiff.toLocaleString()}원 비싸지만, ${planA.data} 데이터를 제공해요.`
      : `${planB.name}보다 월 ${(-feeDiff).toLocaleString()}원 저렴해요.`;
  const planBAdvantage =
    feeDiff < 0
      ? `${planA.name}보다 월 ${(-feeDiff).toLocaleString()}원 비싸지만, ${planB.data} 데이터를 제공해요.`
      : `${planA.name}보다 월 ${feeDiff.toLocaleString()}원 저렴해요.`;

  return {
    summary,
    planAAdvantage,
    planBAdvantage,
    recommendedPlanId: feeDiff <= 0 ? String(planA.id) : String(planB.id),
    reason:
      feeDiff <= 0
        ? `${planA.name}이(가) 더 저렴해요.`
        : `${planB.name}이(가) 더 저렴해요.`,
    planA: planToRecommendedPlan(planA),
    planB: planToRecommendedPlan(planB),
  };
}

// 두 요금제를 LLM으로 비교한 결과를 반환.
async function comparePlans(
  input: ConsultInput,
  plans: Plan[],
  planAName: string,
  planBName: string,
): Promise<RecommendOutput> {
  const planA = plans.find(
    (p) => p.name === planAName || String(p.id) === planAName,
  );
  const planB = plans.find(
    (p) => p.name === planBName || String(p.id) === planBName,
  );

  if (!planA || !planB) {
    return {
      recommendations: [],
      notice: '요금제를 찾을 수 없어요. 정확한 요금제 이름을 입력해주세요.',
      quickReplies: [
        '현재 요금제와 비교',
        '요금제 이름 직접 입력',
        '메뉴로 돌아가기',
      ],
      mode: 'compare',
    };
  }

  const userProfile = `연령대: ${input.ageGroup ?? '미제공'}, 예산: ${input.budget ? input.budget.toLocaleString() + '원' : '제한 없음'}`;
  const usageAnalysis = `월 데이터 사용량: ${input.dataUsage ?? '미제공'}GB, 우선순위: ${input.priority ?? 'budget'}`;

  const filledPrompt = fillTemplate(comparePromptText, {
    userProfile,
    usageAnalysis,
    planA: formatPlanForPrompt(planA),
    planB: formatPlanForPrompt(planB),
  });

  const compareSystemPrompt =
    '당신은 통신 요금제를 비교하는 AI 상담원입니다. 제공된 요금제 정보만 사용해 JSON 형식으로 비교 결과를 작성하세요. 존재하지 않는 가격, 데이터 용량, 혜택을 임의로 만들지 마세요.';

  try {
    const raw = await chatOpenAI(compareSystemPrompt, filledPrompt);
    const parsed = safeJsonParse<{
      summary: string;
      planAAdvantage: string;
      planBAdvantage: string;
      recommendedPlanId: string;
      reason: string;
    }>(raw);

    if (parsed && parsed.summary) {
      return {
        recommendations: [],
        compareResult: {
          ...parsed,
          planA: planToRecommendedPlan(planA),
          planB: planToRecommendedPlan(planB),
        },
        mode: 'compare',
        quickReplies: ['요금제 가입하기', '메뉴로 돌아가기'],
      };
    }
  } catch {
    // LLM 실패 시 코드 fallback
  }

  return {
    recommendations: [],
    compareResult: buildCodeCompareResult(planA, planB),
    mode: 'compare',
    quickReplies: ['요금제 가입하기', '메뉴로 돌아가기'],
  };
}

// 요금제 가입 기초 응답. 비로그인 시 회원가입을 먼저 유도.
function buildSubscribeResponse(isLoggedIn: boolean): RecommendOutput {
  return {
    recommendations: [],
    notice: isLoggedIn
      ? '가입하실 요금제나 가입 경로를 알려주세요. 온라인 가입과 영업점 방문 중 편한 방법을 안내해드릴게요.'
      : '요금제 가입은 로그인 후에 가능해요. 회원가입을 먼저 진행해주세요.',
    quickReplies: isLoggedIn
      ? ['온라인 가입', '영업점 방문', '메뉴로 돌아가기']
      : ['회원 가입하기', '영업점 방문', '메뉴로 돌아가기'],
    mode: 'subscribe',
  };
}

// 상담 외 주제 응답 — 통신 요금제와 무관한 질문을 안내하고 메뉴로 유도
function buildOutOfScopeResponse(isLoggedIn: boolean): RecommendOutput {
  return {
    recommendations: [],
    notice:
      '죄송해요, 저는 통신 요금제 상담 도우미예요. 요금제 추천, 비교, 가입, 혜택 등 통신 관련 질문만 도와드릴 수 있어요. 아래 메뉴에서 원하는 항목을 선택해 주세요.',
    quickReplies: isLoggedIn
      ? ['요금제 추천받기', '요금제 비교하기', '요금제 가입하기', '기타 상담']
      : ['회원 가입하기', '요금제 추천받기', '요금제 비교하기', '기타 상담'],
    mode: 'out_of_scope',
  };
}

// 일반 상담 기초 응답. 로그인 여부에 따라 가입 버튼을 다르게 노출.
function buildGeneralResponse(isLoggedIn: boolean): RecommendOutput {
  return {
    recommendations: [],
    notice:
      '어떤 도움이 필요하신가요? 요금제, 가입, 혜택 등 궁금한 내용을 자유롭게 입력해 주세요.',
    quickReplies: [
      '요금제 추천받기',
      '요금제 비교하기',
      isLoggedIn ? '요금제 가입하기' : '회원 가입하기',
      '메뉴로 돌아가기',
    ],
    mode: 'general',
  };
}

// 게임 기초 응답.
function buildGameResponse(): RecommendOutput {
  return {
    recommendations: [],
    notice:
      '게임을 시작할까요? 간단한 이벤트 게임이나 레크리에이션을 즐길 수 있어요.',
    quickReplies: ['게임 설명 보기', '게임 시작', '메뉴로 돌아가기'],
    mode: 'game',
  };
}

// 출석체크 기초 응답.
function buildAttendanceResponse(): RecommendOutput {
  return {
    recommendations: [],
    notice:
      '출석체크를 도와드릴게요. 오늘 출석을 등록하거나 누적 현황을 확인할 수 있어요.',
    quickReplies: ['오늘 출석 등록', '출석 현황 보기', '메뉴로 돌아가기'],
    mode: 'attendance',
  };
}

// 레포트 생성 안내 응답.
// 채팅 입력으로 "레포트 생성"을 시도한 경우, 추천 결과가 있어야 생성 가능함을 안내.
// 실제 레포트 생성은 추천 카드의 "레포트 생성" 버튼을 통해 프론트엔드에서 직접 호출됨.
function buildReportResponse(): RecommendOutput {
  return {
    recommendations: [],
    notice:
      '상담 리포트는 요금제 추천을 먼저 받은 후 생성할 수 있어요. 추천받기 메뉴를 선택해 요금제를 먼저 추천받아 주세요. 추천 결과가 나오면 카드 아래의 "레포트 생성" 버튼으로 리포트를 만들 수 있어요.',
    quickReplies: ['요금제 추천받기', '메뉴로 돌아가기'],
    mode: 'report',
  };
}

function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (t, [key, value]) => t.replaceAll(`{${key}}`, value),
    template,
  );
}

function formatPlanForPrompt(p: Plan): string {
  const benefits = (p.benefits ?? []).join(', ');
  return `id: ${p.id}, name: ${p.name}, data: ${p.data}, fee: ${p.monthly_fee}, benefits: [${benefits}]`;
}

// 상위 3개 요금제 추천 및 사유, 절감액 산출.
export async function recommendPlan(
  input: ConsultInput,
): Promise<RecommendOutput> {
  const mode = resolveNextMode(input);
  if (mode === 'menu') return buildMenuResponse(input.isLoggedIn ?? false);
  if (mode === 'compare') {
    // 비교할 두 요금제가 명시적으로 지정된 경우 실제 비교 수행
    if (input.comparePlanA && input.comparePlanB) {
      const plans = await loadPlans();
      return comparePlans(input, plans, input.comparePlanA, input.comparePlanB);
    }
    // 사용자 메시지에서 요금제 이름 두 개를 파싱 시도
    const plans = await loadPlans();
    const parsedNames = parseComparePlanNames(input.userMessage ?? '', plans);
    if (parsedNames) {
      return comparePlans(input, plans, parsedNames[0], parsedNames[1]);
    }
    // 비교할 요금제가 지정되지 않았으면 안내 메시지
    return buildCompareResponse(input.isLoggedIn ?? false);
  }
  if (mode === 'subscribe')
    return buildSubscribeResponse(input.isLoggedIn ?? false);
  if (mode === 'out_of_scope')
    return buildOutOfScopeResponse(input.isLoggedIn ?? false);
  if (mode === 'general')
    return buildGeneralResponse(input.isLoggedIn ?? false);
  if (mode === 'game') return buildGameResponse();
  if (mode === 'attendance') return buildAttendanceResponse();
  if (mode === 'report') return buildReportResponse();

  const missingInfo = buildInfoRequest(input);
  if (missingInfo)
    return {
      recommendations: [],
      notice: missingInfo,
      mode: 'recommend',
      quickReplies: [],
      form: buildInfoForm(input),
    };

  const plans = await loadPlans();
  const candidates = filterRecommendPlans(plans, input);
  const notice = buildNotice(plans, input);

  const codeRecs: RecommendOutput = {
    recommendations: candidates.slice(0, 3).map(
      (p) =>
        ({
          planId: String(p.id),
          planName: p.name,
          reason: '',
          savingAmount: 0,
        }) as RecommendedPlan,
    ),
  };
  const sanitized = await sanitizeRecommendations(codeRecs, plans, input);

  if (!notice) return { ...sanitized, mode: 'recommend' };

  if (candidates.length === 0) {
    return { recommendations: [], notice, mode: 'recommend' };
  }

  const plansText = candidates.slice(0, 3).map(formatPlanForPrompt).join('\n');
  const filledPrompt = fillTemplate(noticePromptText, {
    currentPlan: input.currentPlan ?? '미등록',
    dataUsage: String(input.dataUsage ?? 0),
    budget: input.budget ? String(input.budget) : '제한 없음',
    ageGroup: input.ageGroup ?? '미제공',
    ott: input.ott?.join(', ') || '없음',
    priority: input.priority ?? 'budget',
    fallback: notice,
    plans: plansText,
  });

  try {
    const raw = await chatOpenAI(noticeSystemPrompt, filledPrompt);
    const parsed = safeJsonParse<{ notice: string }>(raw);
    const finalNotice = parsed?.notice?.trim() || notice;
    return { ...sanitized, notice: finalNotice, mode: 'recommend' };
  } catch {
    return { ...sanitized, notice, mode: 'recommend' };
  }
}

// 모드에 맞는 Quick Reply 목록을 생성합니다.
export async function generateQuickReplies(
  input: ConsultInput,
  result: RecommendOutput,
): Promise<string[]> {
  if (result.form) return [];

  const mode = result.mode ?? input.mode ?? 'menu';

  if (mode === 'menu') {
    // 비회원에게는 게임/출석체크(로그인 필요) 메뉴를 노출하지 않음
    return input.isLoggedIn
      ? [
          '요금제 추천받기',
          '요금제 비교하기',
          '요금제 가입하기',
          '게임 하기',
          '출석체크',
          '기타 상담',
        ]
      : ['회원 가입하기', '요금제 추천받기', '요금제 비교하기', '기타 상담'];
  }
  if (mode === 'compare') {
    // 비교 결과가 있으면 comparePlans에서 설정한 quickReplies 유지
    if (result.compareResult) return result.quickReplies ?? [];
    return ['현재 요금제와 비교', '요금제 이름 직접 입력', '메뉴로 돌아가기'];
  }
  if (mode === 'subscribe') {
    return ['온라인 가입', '영업점 방문', '메뉴로 돌아가기'];
  }
  if (mode === 'out_of_scope') {
    return input.isLoggedIn
      ? ['요금제 추천받기', '요금제 비교하기', '요금제 가입하기', '기타 상담']
      : ['회원 가입하기', '요금제 추천받기', '요금제 비교하기', '기타 상담'];
  }
  if (mode === 'general') {
    return [
      '요금제 추천받기',
      '요금제 비교하기',
      '요금제 가입하기',
      '메뉴로 돌아가기',
    ];
  }
  if (mode === 'game') {
    return ['게임 설명 보기', '게임 시작', '메뉴로 돌아가기'];
  }
  if (mode === 'attendance') {
    return ['오늘 출석 등록', '출석 현황 보기', '메뉴로 돌아가기'];
  }
  if (mode === 'report') {
    // buildReportResponse에서 설정한 quickReplies 유지
    return result.quickReplies ?? ['요금제 추천받기', '메뉴로 돌아가기'];
  }

  // recommend 모드: 기존 추천 후속 질문 로직
  const qs: string[] = [];
  const hasNotice = !!result.notice;
  const isBudget = input.priority === 'budget';
  const isData = input.priority === 'data';
  const isMaxData = input.priority === 'max_data';
  const hasOtt = (input.ott || []).length > 0;

  const missingGroups: string[][] = [];
  if (!input.ageGroup || input.ageGroup === '미제공') {
    missingGroups.push(['20대 직장인이에요', '청소년이에요', '어르신이에요']);
  }
  if (input.dataUsage === undefined) {
    missingGroups.push([
      '월 10GB 사용해요',
      '월 30GB 사용해요',
      '데이터를 많이 써요',
    ]);
  }
  if (input.budget === undefined) {
    missingGroups.push([
      '예산 5만원이에요',
      '예산 7만원이에요',
      '가장 저렴한 걸로 보여줘',
    ]);
  }
  if (missingGroups.length > 0) {
    let idx = 0;
    while (qs.length < 3 && missingGroups.some((g) => idx < g.length)) {
      for (const group of missingGroups) {
        if (idx < group.length && qs.length < 3) {
          qs.push(group[idx]);
        }
      }
      idx++;
    }
    qs.push('메뉴로 돌아가기');
    return qs;
  }

  if (hasNotice) {
    if (isData) {
      qs.push('예산을 조금 더 늘려서 추천받기');
      qs.push('데이터 용량을 줄여서 추천받기');
      qs.push('다른 OTT 없는 요금제 보기');
    } else if (isMaxData) {
      qs.push('예산을 늘려서 더 큰 용량 보기');
      qs.push('가장 저렴한 요금제 보기');
      qs.push('데이터가 10GB인 요금제 보기');
    } else {
      qs.push('데이터 용량이 더 큰 요금제 보기');
      qs.push('더 저렴한 요금제 보기');
      qs.push('OTT 포함 요금제 보기');
    }
    qs.push('메뉴로 돌아가기');
    return [...qs.slice(0, 3), '메뉴로 돌아가기'];
  }

  if (!isMaxData) qs.push('데이터가 더 큰 요금제 보기');
  if (!isBudget) qs.push('더 저렴한 요금제 보기');
  if (!hasOtt) qs.push('OTT 포함 요금제 보기');
  if (hasOtt) qs.push('OTT 혜택 없는 요금제 보기');
  if (input.ageGroup !== '청소년') qs.push('청소년 요금제도 보기');

  return [...qs.slice(0, 3), '메뉴로 돌아가기'];
}

const reportSystemPrompt = `
당신은 AI 통신 요금제 상담 내용을 요약하는 역할을 담당합니다.
제공된 조건과 추천 결과만 사용해 JSON 형식으로 레포트를 작성하세요.
존재하지 않는 가격, 데이터 용량, 혜택을 임의로 만들지 마세요.
`;

const generalReportSystemPrompt = `
당신은 AI 통신 상담 대화 내용을 요약하는 역할을 담당합니다.
제공된 대화 내용만 사용해 JSON 형식으로 요약하세요.
존재하지 않는 정보를 임의로 만들지 마세요.
`;

// 상담 대화와 추천 결과를 바탕으로 요약 레포트를 생성합니다.
// reportKind가 'general'이면 요금제 추천 없이 일반 대화만 요약합니다.
export async function generateReport(
  input: ReportInput,
): Promise<ReportOutput> {
  const {
    conversation,
    currentPlan,
    recommendationResult,
    reportKind,
    userProfile,
  } = input;
  const isGeneral = reportKind === 'general';

  const filledPrompt = isGeneral
    ? fillTemplate(generalReportPromptText, { conversation, userProfile })
    : fillTemplate(reportPromptText, {
        conversation,
        currentPlan: currentPlan || '미등록',
        recommendationResult,
        userProfile,
      });

  const systemPrompt = isGeneral
    ? generalReportSystemPrompt
    : reportSystemPrompt;

  const raw = await chatOpenAI(systemPrompt, filledPrompt, 1200, true);
  const parsed = safeJsonParse<ReportOutput>(raw);
  if (parsed && parsed.summary) return parsed;
  // 파싱은 됐으나 summary가 비어 있거나, JSON 파싱 실패 시 원문을 함께 던짐
  throw new Error(`report parse fail. raw=${raw}`);

  // 일반 대화 요약 fallback — 요금제 필드는 빈값/미등록
  if (isGeneral) {
    return {
      summary: '상담 내용을 요약한 레포트입니다.',
      usageType: '',
      currentPlan: '미등록',
      recommendedPlans: [],
      recommendationReason: '상담에서 안내된 내용을 확인해주세요.',
      monthlySavingAmount: 0,
      importantConditions: [],
      qaPairs: [],
    };
  }

  // 요금제 추천 fallback — 추천 결과 텍스트에서 최소한의 요금제 이름과 절감액을 추출
  const fallbackPlans = recommendationResult
    .split('\n')
    .map((line) => {
      const match = line.match(/^(.+?)\s*\(/);
      return match ? match[1].trim() : line.trim();
    })
    .filter((line) => line.length > 0);

  const savingMatch = recommendationResult.match(/절감액\s+([\d,]+)원/);
  const fallbackSaving = savingMatch
    ? parseInt(savingMatch[1].replace(/,/g, ''), 10)
    : 0;

  return {
    summary: '요금제 추천 상담 내용을 요약한 레포트입니다.',
    usageType: '',
    currentPlan: currentPlan || '미등록',
    recommendedPlans: fallbackPlans,
    recommendationReason:
      recommendationResult || '추천된 요금제를 확인해주세요.',
    monthlySavingAmount: Number.isNaN(fallbackSaving) ? 0 : fallbackSaving,
    importantConditions: [],
    qaPairs: [],
  };
}
