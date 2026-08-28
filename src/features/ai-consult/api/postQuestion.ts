import { requestConsult } from '@/lib/aiConsult';
import type { ChatMode, ConsultInput, ConsultResponse } from '@/lib/aiConsult';

import { TELECOM_KEYWORDS } from '../constants/telecomKeywords';

// OTT 키워드 정규화 맵: 사용자가 입력한 별칭을 canonical 키워드로 변환
const OTT_ALIASES: Record<string, string> = {
  넷플릭스: '넷플릭스',
  넷플: '넷플릭스',
  '유튜브 프리미엄': '유튜브 프리미엄',
  유튜브: '유튜브 프리미엄',
  '디즈니+': '디즈니+',
  디즈니: '디즈니+',
  왓챠: '왓챠',
  웨이브: '웨이브',
  쿠팡플레이: '쿠팡플레이',
  쿠팡: '쿠팡플레이',
  '애플 뮤직': '애플 뮤직',
  애플: '애플 뮤직',
  멜론: '멜론',
  스포티파이: '스포티파이',
};

// 사용자 메시지에서 상담 조건(연령/데이터/예산/OTT 등)을 추출해 ConsultInput으로 누적합니다.
export function parseUserInput(text: string, prev: ConsultInput): ConsultInput {
  const t = text.trim();
  const next: ConsultInput = {
    ...prev,
    userMessage: t,
    isLoggedIn: prev.isLoggedIn,
  };

  // 메뉴 선택 단계에서는 추천 조건 파싱을 건너뜁니다.
  if (prev.mode === 'menu') {
    return next;
  }

  const ageMatch = t.match(/(\d{1,2})\s*(?:살|세)/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    if (age < 20) next.ageGroup = '청소년';
    else if (age < 30) next.ageGroup = '20대';
    else if (age < 40) next.ageGroup = '30대';
    else if (age < 50) next.ageGroup = '40대';
    else next.ageGroup = '50대 이상';
  } else if (/청소년/.test(t)) next.ageGroup = '청소년';
  else if (/20대|직장인/.test(t)) next.ageGroup = '20대';
  else if (/30대/.test(t)) next.ageGroup = '30대';
  else if (/40대/.test(t)) next.ageGroup = '40대';
  else if (/50대|60대|어르신|시니어/.test(t)) next.ageGroup = '50대 이상';

  // 현재 사용 중인 요금제 파싱
  const currentPlanMatch =
    t.match(/현재\s*요금제[\s:]*(.+?)(?:\n|$)/) ||
    t.match(/현재\s*사용[\s중]*[\s:]*(.+?)(?:\n|$)/) ||
    t.match(/쓰고\s*있는\s*요금제[\s:]*(.+?)(?:\n|$)/);
  if (currentPlanMatch) {
    next.currentPlan = currentPlanMatch[1].trim();
  }

  const gbMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:GB|G|기가)(?![a-zA-Z])/i);
  if (gbMatch) {
    next.dataUsage = parseFloat(gbMatch[1]);
  } else if (
    /데이터\s*(?:많|큰)|많이\s*써|월\s*많게|용량\s*큰|데이터\s*부족/.test(t)
  ) {
    next.dataUsage = (next.dataUsage ?? 0) + 5;
    next.priority = 'data';
  } else if (/무제한|완전\s*무제한|데이터\s*많이/.test(t)) {
    next.dataUsage = 100;
    next.priority = 'max_data';
  }

  const manMatch = t.match(/(\d+(?:\.\d+)?)\s*만(?:원)?/);
  const wonMatch = t.match(/(\d{4,7})\s*원/);
  if (manMatch) {
    next.budget = Math.round(parseFloat(manMatch[1]) * 10000);
  } else if (wonMatch) {
    next.budget = parseInt(wonMatch[1], 10);
  }

  if (/가장\s*저렴|싼|최저|절감|가격\s*우선|예산\s*안|저렴한/.test(t)) {
    next.priority = 'budget';
    if (next.budget === undefined) next.budget = 0;
  } else if (/데이터.*(?:많|큰)|용량.*큰|데이터\s*우선|데이터\s*중심/.test(t)) {
    next.priority = 'data';
  } else if (
    /최대\s*데이터|완전\s*무제한|많은\s*데이터|데이터\s*최대/.test(t)
  ) {
    next.priority = 'max_data';
  }

  // 빠른 답변(Quick Reply) 터치에 따른 조건 조정
  if (/데이터가\s*더\s*큰/.test(t)) {
    next.priority = 'data';
    next.dataUsage = (next.dataUsage ?? 0) + 5;
  } else if (/더\s*저렴한/.test(t)) {
    next.priority = 'budget';
    if (next.budget !== undefined)
      next.budget = Math.max(0, next.budget - 10000);
  } else if (/OTT\s*포함/.test(t)) {
    if (!next.ott || next.ott.length === 0) next.ott = ['넷플릭스'];
  } else if (/OTT\s*혜택\s*없는/.test(t)) {
    next.ott = [];
  } else if (/청소년\s*요금제/.test(t)) {
    next.ageGroup = '청소년';
  }

  const explicitNoOtt = /OTT\s*없|혜택\s*없|OTT\s*안/.test(t);
  // 긴 별칭을 먼저 매칭해 '유튜브 프리미엄'이 '유튜브'로 잘몤 매칭되는 것을 방지
  const sortedAliases = Object.keys(OTT_ALIASES).sort(
    (a, b) => b.length - a.length,
  );
  for (const alias of sortedAliases) {
    if (t.includes(alias)) {
      if (explicitNoOtt) continue;
      const canonical = OTT_ALIASES[alias];
      const current = next.ott ?? [];
      if (!current.includes(canonical)) next.ott = [...current, canonical];
    }
  }

  return next;
}

// 프론트엔드 폴백: 메뉴 상태에서 통신과 무관한 입력 감지 시 Edge Function 호출 전 차단
function isOutOfScope(text: string, prevMode?: ChatMode): boolean {
  if (prevMode !== 'menu') return false;
  const normalized = text.toLowerCase().replace(/\s+/g, '');
  return !TELECOM_KEYWORDS.some((kw) =>
    normalized.includes(kw.toLowerCase().replace(/\s+/g, '')),
  );
}

// 상담 외 주제 폴백 응답 — Edge Function 미응답 시 프론트엔드에서 직접 생성
function buildOutOfScopeFallback(isLoggedIn: boolean): ConsultResponse {
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

export async function postQuestion(
  text: string,
  prev: ConsultInput,
): Promise<{ input: ConsultInput; response: ConsultResponse }> {
  const input = parseUserInput(text, prev);

  // 프론트엔드 폴백: 메뉴 상태에서 통신과 무관한 입력은 Edge Function 호출 전 차단
  if (isOutOfScope(text, prev.mode)) {
    return {
      input: { ...input, mode: 'out_of_scope' },
      response: buildOutOfScopeFallback(prev.isLoggedIn ?? false),
    };
  }

  const response = await requestConsult(input);
  return { input, response };
}
