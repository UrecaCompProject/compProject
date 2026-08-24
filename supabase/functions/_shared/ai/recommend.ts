// @ts-nocheck
// LangChain 없이 OpenAI /v1/chat/completions를 직접 호출하는 요금제 추천 로직.
import { loadPlans } from './data.ts';
import type { Plan } from './data.ts';
import { noticePromptText, reasonPromptText } from './prompts/index.ts';
import { chatOpenAI } from './openai.ts';
import type {
  ChatMode,
  ConsultForm,
  ConsultInput,
  RecommendOutput,
  RecommendedPlan,
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
function buildInfoRequest(input: ConsultInput): string | undefined {
  const critical: string[] = [];
  if (!input.ageGroup || input.ageGroup === '미제공') critical.push('나이');
  if (input.dataUsage === undefined) critical.push('월 데이터 사용량');

  if (critical.length === 0) return undefined;

  if (input.budget === undefined) critical.push('예산');
  const requestText = critical.map((w) => josa(w, '을/를')).join(', ');
  return `상세 정보를 입력하시면 더 자세한 맞춤 요금제를 추천해드릴 수 있어요! (${requestText} 알려주세요)`;
}

// 누락된 추천 조건을 form으로 입력받을 수 있도록 구성합니다.
function buildInfoForm(input: ConsultInput): ConsultForm {
  const fields: ConsultForm['fields'] = [];

  if (!input.ageGroup || input.ageGroup === '미제공') {
    fields.push({
      name: 'ageGroup',
      label: '나이',
      type: 'select',
      options: ['청소년', '20대', '30대', '40대', '50대 이상'],
      required: true,
    });
  }

  if (input.dataUsage === undefined) {
    fields.push({
      name: 'dataUsage',
      label: '월 데이터 사용량',
      type: 'number',
      required: true,
    });
  }

  if (input.budget === undefined) {
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
  const filters = buildCandidateFilters(input);
  let candidates: Plan[] = [];

  for (const filter of filters) {
    candidates = plans.filter(filter);
    if (candidates.length >= 3) break;
  }

  if (candidates.length === 0) {
    candidates = plans.filter((p) => ageMatches(input.ageGroup, p.target_age));
  }

  const ott = input.ott;
  if (ott && ott.length > 0) {
    const seen = new Set(candidates.map((p) => p.id));
    for (const p of plans) {
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

// 사용자 메시지와 이전 모드에서 다음 단계 모드를 결정합니다.
function resolveNextMode(input: ConsultInput): ChatMode {
  const t = (input.userMessage || '').trim();
  const current = input.mode ?? 'menu';

  if (/^메뉴|^처음|^처음으로|^돌아가기|^안녕|^시작/.test(t)) return 'menu';
  if (/요금제\s*추천|추천받기|맞춤\s*추천/.test(t)) return 'recommend';
  if (/요금제\s*비교|비교\s*하기|비교해/.test(t)) return 'compare';
  if (/요금제\s*가입|가입\s*하기|신청/.test(t)) return 'subscribe';
  if (/상담|문의|질문|도움/.test(t)) return 'general';
  if (/게임|미니게임/.test(t)) return 'game';
  if (/출석|출첵|출석체크/.test(t)) return 'attendance';

  // 이전 모드를 유지하며, 메뉴라면 추천으로 전진시킵니다.
  if (current === 'menu' && t.length > 0) return 'recommend';
  return current;
}

// 초기 메뉴 응답.
function buildMenuResponse(): RecommendOutput {
  return {
    recommendations: [],
    notice: '원하시는 메뉴를 선택해 주세요.',
    quickReplies: [
      '요금제 추천받기',
      '요금제 비교하기',
      '요금제 가입하기',
      '게임 하기',
      '출석체크',
      '기타 상담',
    ],
    mode: 'menu',
  };
}

// 요금제 비교 기초 응답.
function buildCompareResponse(): RecommendOutput {
  return {
    recommendations: [],
    notice:
      '비교할 요금제를 알려주세요. 현재 요금제와 추천 요금제를 비교하거나, 두 요금제 이름을 직접 입력할 수 있어요.',
    quickReplies: [
      '현재 요금제와 비교',
      '요금제 이름 직접 입력',
      '메뉴로 돌아가기',
    ],
    mode: 'compare',
  };
}

// 요금제 가입 기초 응답.
function buildSubscribeResponse(): RecommendOutput {
  return {
    recommendations: [],
    notice:
      '가입하실 요금제나 가입 경로를 알려주세요. 온라인 가입과 영업점 방문 중 편한 방법을 안내해드릴게요.',
    quickReplies: ['온라인 가입', '영업점 방문', '메뉴로 돌아가기'],
    mode: 'subscribe',
  };
}

// 일반 상담 기초 응답.
function buildGeneralResponse(): RecommendOutput {
  return {
    recommendations: [],
    notice:
      '어떤 도움이 필요하신가요? 요금제, 가입, 혜택 등 궁금한 내용을 자유롭게 입력해 주세요.',
    quickReplies: [
      '요금제 추천받기',
      '요금제 비교하기',
      '요금제 가입하기',
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
  if (mode === 'menu') return buildMenuResponse();
  if (mode === 'compare') return buildCompareResponse();
  if (mode === 'subscribe') return buildSubscribeResponse();
  if (mode === 'general') return buildGeneralResponse();
  if (mode === 'game') return buildGameResponse();
  if (mode === 'attendance') return buildAttendanceResponse();

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
    return [
      '요금제 추천받기',
      '요금제 비교하기',
      '요금제 가입하기',
      '게임 하기',
      '출석체크',
      '기타 상담',
    ];
  }
  if (mode === 'compare') {
    return ['현재 요금제와 비교', '요금제 이름 직접 입력', '메뉴로 돌아가기'];
  }
  if (mode === 'subscribe') {
    return ['온라인 가입', '영업점 방문', '메뉴로 돌아가기'];
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
    return qs.slice(0, 3);
  }

  if (!isMaxData) qs.push('데이터가 더 큰 요금제 보기');
  if (!isBudget) qs.push('더 저렴한 요금제 보기');
  if (!hasOtt) qs.push('OTT 포함 요금제 보기');
  if (hasOtt) qs.push('OTT 혜택 없는 요금제 보기');
  if (input.ageGroup !== '청소년') qs.push('청소년 요금제도 보기');

  return qs.slice(0, 3);
}
