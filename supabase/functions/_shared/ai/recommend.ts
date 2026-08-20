// @ts-nocheck
// LangChain 없이 Ollama /api/chat을 직접 호출하는 요금제 추천 로직.
import { loadPlans } from './data.ts';
import type { Plan } from './data.ts';
import { noticePromptText } from './prompts/index.ts';
import { chatOllama } from './ollamaFetch.ts';
import type {
  ConsultInput,
  RecommendOutput,
  RecommendedPlan,
} from './types.ts';

const OTT_SERVICES = [
  '넷플릭스',
  '유튜브 프리미엄',
  '디즈니+',
  '왓챠',
  '웨이브',
  '쿠팡플레이',
  '티빙',
  '애플 뮤직',
  '멜론',
  '스포티파이',
];

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
function hasOttMatch(ott: string[] | undefined, benefits: string[]): boolean {
  if (!ott || ott.length === 0) return false;
  const benefitText = benefits.join(' ').toLowerCase();
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

// 받침 유무에 따른 조사 선택.
function josa(word: string, tail: string): string {
  const last = word[word.length - 1];
  const code = last.charCodeAt(0) - 0xac00;
  const hasJong = code % 28 !== 0;
  return word + (hasJong ? tail[0] : tail[2]);
}

// 사용자 조건에 맞는 상위 후보 요금제만 추려 prompt 길이를 줄임.
function filterRecommendPlans(plans: Plan[], input: ConsultInput): Plan[] {
  const dataUsage = input.dataUsage ?? 0;
  const budget = input.budget ?? Number.MAX_SAFE_INTEGER;
  const ageGroup = input.ageGroup;
  const ott = input.ott;
  const isDataPriority = input.priority === 'data';
  const isMaxDataPriority = input.priority === 'max_data';

  const ageOk = (p: Plan) => ageMatches(ageGroup, p.target_age);

  let candidates: Plan[];
  if (isMaxDataPriority) {
    candidates = plans.filter((p) => ageOk(p) && p.monthly_fee <= budget);
    if (candidates.length === 0) {
      candidates = plans.filter((p) => ageOk(p));
    }
  } else if (isDataPriority) {
    candidates = plans.filter(
      (p) =>
        ageOk(p) && parseDataGB(p.data) >= dataUsage && p.monthly_fee <= budget,
    );
    if (candidates.length < 3) {
      candidates = plans.filter(
        (p) => ageOk(p) && parseDataGB(p.data) >= dataUsage,
      );
    }
    if (candidates.length < 3) {
      candidates = plans.filter(
        (p) => ageOk(p) && parseDataGB(p.data) >= dataUsage * 0.7,
      );
    }
    if (candidates.length < 3) {
      candidates = plans.filter((p) => ageOk(p) && p.monthly_fee <= budget);
    }
  } else {
    candidates = plans.filter(
      (p) =>
        ageOk(p) &&
        p.monthly_fee <= budget &&
        parseDataGB(p.data) >= dataUsage &&
        hasOttMatch(ott, p.benefits),
    );
    if (candidates.length < 3) {
      candidates = plans.filter(
        (p) =>
          ageOk(p) &&
          p.monthly_fee <= budget &&
          parseDataGB(p.data) >= dataUsage * 0.7 &&
          hasOttMatch(ott, p.benefits),
      );
    }
    if (candidates.length < 3) {
      candidates = plans.filter(
        (p) =>
          ageOk(p) &&
          p.monthly_fee <= budget &&
          parseDataGB(p.data) >= dataUsage,
      );
    }
    if (candidates.length < 3) {
      candidates = plans.filter(
        (p) =>
          ageOk(p) &&
          p.monthly_fee <= budget &&
          parseDataGB(p.data) >= dataUsage * 0.7,
      );
    }
    if (candidates.length < 3) {
      candidates = plans.filter((p) => ageOk(p) && p.monthly_fee <= budget);
    }
  }

  if (candidates.length === 0) {
    candidates = plans.filter((p) => ageOk(p));
  }

  if (ott && ott.length > 0) {
    const seen = new Set(candidates.map((p) => p.id));
    for (const p of plans) {
      if (ageOk(p) && hasOttMatch(ott, p.benefits) && !seen.has(p.id)) {
        candidates.push(p);
      }
    }
  }

  const DATA_WEIGHT = 1_000_000;
  return candidates
    .map((p) => {
      const dataValue = parseDataGB(p.data);
      const isExact = dataValue >= dataUsage;
      const ottBonus = hasOttMatch(ott, p.benefits) ? 1_000 : 0;

      let score: number;
      if (isMaxDataPriority) {
        score = -dataValue * DATA_WEIGHT + p.monthly_fee - ottBonus;
      } else if (isDataPriority) {
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

// 현재 요금제의 월 요금을 찾음. 없으면 0.
function findCurrentPlanFee(
  plans: Plan[],
  currentPlanName: string | undefined,
): number {
  if (!currentPlanName || currentPlanName === '미등록') return 0;
  const found = plans.find((p) => p.name === currentPlanName);
  return found?.monthly_fee ?? 0;
}

// LLM 출력을 실제 데이터로 보정하고, 이유와 절감액은 코드에서 재생성해 환각을 차단.
function sanitizeRecommendations(
  output: RecommendOutput,
  plans: Plan[],
  input: ConsultInput,
): RecommendOutput {
  const currentPlanFee = findCurrentPlanFee(plans, input.currentPlan);

  const valid = output.recommendations
    .map((r) => {
      const plan = plans.find((p) => String(p.id) === String(r.planId));
      if (!plan) return null;
      const saving =
        currentPlanFee > 0 ? Math.max(0, currentPlanFee - plan.monthly_fee) : 0;

      let reason = `데이터 ${plan.data}, 월 ${plan.monthly_fee.toLocaleString()}원`;
      const matchedOtt = Array.from(
        new Set(
          plan.benefits.flatMap((benefit) =>
            OTT_SERVICES.filter((service) =>
              benefit.toLowerCase().includes(service.toLowerCase()),
            ),
          ),
        ),
      );
      if (matchedOtt.length > 0) {
        reason += `이며 ${matchedOtt.join(', ')} 혜택이 포함돼 있어요.`;
      } else {
        reason += '이에요.';
      }
      if (saving > 0) {
        reason += ` 현재 요금제보다 월 ${saving.toLocaleString()}원 절감돼요.`;
      }

      return {
        planId: String(plan.id),
        planName: plan.name,
        reason,
        savingAmount: saving,
      };
    })
    .filter((r): r is RecommendedPlan => r !== null);

  return { recommendations: valid.slice(0, 3) };
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
  return `id: ${p.id}, name: ${p.name}, data: ${p.data}, fee: ${p.monthly_fee}, benefits: [${p.benefits.join(', ')}]`;
}

// 상위 3개 요금제 추천 및 사유, 절감액 산출.
export async function recommendPlan(
  input: ConsultInput,
): Promise<RecommendOutput> {
  const missingInfo = buildInfoRequest(input);
  if (missingInfo) return { recommendations: [], notice: missingInfo };

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
  const sanitized = sanitizeRecommendations(codeRecs, plans, input);

  if (!notice) return sanitized;

  if (candidates.length === 0) {
    return { recommendations: [], notice };
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
    const raw = await chatOllama(noticeSystemPrompt, filledPrompt);
    const parsed = safeJsonParse<{ notice: string }>(raw);
    const finalNotice = parsed?.notice?.trim() || notice;
    return { ...sanitized, notice: finalNotice };
  } catch {
    return { ...sanitized, notice };
  }
}

// 추천 결과에 맞는 사전 정의된 후속 질문(Quick Reply)을 생성.
export async function generateQuickReplies(
  input: ConsultInput,
  result: RecommendOutput,
): Promise<string[]> {
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
